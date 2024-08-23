const qsys = require('@qsys')
const dbQsys = require('@db/models/qsys')
const dbPage = require('@db/models/page')
const dbBarix = require('@db/models/barix')
const logger = require('@logger')
const { fnSendSocket } = require('@api/socket')
const { fnSetTransmitter, fnGetTransmitter } = require('@qsys/toQsys')

module.exports = async function parser(deviceId, obj, arr) {
  try {
    const { id, result } = obj
    let ZoneStatus = []
    let idx = null
    switch (id) {
      case 1000:
        // dbQsys.updateOne({ deviceId }, { EngineStatus: result }).exec()
        fnSendSocket('EngineStatus', { deviceId, EngineStatus: result })
        break
      case 2000:
        idx = qsys.arr.findIndex((item) => item.deviceId === deviceId)
        qsys.arr[idx].ZoneStatusConfigure = result == true
        fnSendSocket('ZoneStatusConfigure', {
          deviceId,
          ZoneStatusConfigure: result == true
        })
        break
      case 2001:
        dbQsys.updateOne({ deviceId }, { PaConfig: result }).exec()
        break
      case 2002:
      case 2003:
      case 2008:
      case 2009:
        break
      case 3001:
        const volumeMute = result.Controls
        idx = qsys.arr.findIndex((item) => item.deviceId === deviceId)
        ZoneStatus = qsys.arr[idx].ZoneStatus
        for (let val of volumeMute) {
          const channel = Number(val.Name.replace(/[^0-9]/g, ''))
          const idx = ZoneStatus.findIndex((item) => item.Zone === channel)
          if (idx === -1) return

          if (val.Name.includes('gain')) {
            ZoneStatus[idx].gain = val.Value
          }

          if (val.Name.includes('mute')) {
            ZoneStatus[idx].mute = val.Value
          }
        }
        // ZoneStatus에서 gain, mute 만 추출
        const vols = ZoneStatus.map((item) => {
          return {
            Zone: item.Zone,
            gain: item.gain,
            mute: item.mute,
            Active: item.Active
          }
        })

        fnSendSocket('ZoneStatus', { deviceId, ZoneStatus: vols })
        break
      case 3003:
      case 3004:
        fnSendSocket('VolumeMute', deviceId)
        break
      case 4001:
        break
      case 4002:
        const zone = result.Name.replace(/[^0-9]/g, '')
        const value = result.Controls[0].String
        fnSendSocket('qsys:get:tr', { deviceId, zone, value })
        break
      case 4004:
        break
      default:
        logger.info(`ID evnet ${deviceId}, ${obj}, ${arr}`)
        if (Object.keys(result).includes('PageID')) {
          fnSendSocket('page:pageId', {
            deviceId,
            idx: id,
            PageID: result.PageID
          })
        }
        break
    }
  } catch (error) {
    logger.error(`id parser error: ${error}`)
  }
}
