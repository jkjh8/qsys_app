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
    switch (id) {
      case 1000:
        dbQsys.updateOne({ deviceId }, { EngineStatus: result }).exec()

        break
      case 2000:
        if (result) {
          const idx = qsys.arr.findIndex((item) => item.deviceId === deviceId)
          const ZoneStatus = qsys.arr[idx].ZoneStatus
          dbQsys
            .updateOne({ deviceId }, { ZoneStatus, ZoneStatusConfigure: true })
            .exec()
        } else {
          dbQsys.updateOne({ deviceId }, { ZoneStatusConfigure: false }).exec()
        }
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
        const vols = result.Controls
        dbQsys
          .findOne({ deviceId })
          .populate(
            'ZoneStatus.destination',
            'name idx deviceId ipaddress status streamurl'
          )
          .then((res) => {
            const ZoneStatus = res.ZoneStatus
            for (let val of vols) {
              const channel = Number(val.Name.replace(/[^0-9]/g, ''))
              const idx = ZoneStatus.findIndex((item) => item.Zone === channel)

              if (val.Name.includes('gain')) {
                ZoneStatus[idx].gain = val.Value
              }

              if (val.Name.includes('mute')) {
                ZoneStatus[idx].mute = val.Value
              }
            }
            // db update & send socket
            // console.log('ZoneStatus', { deviceId, ZoneStatus })
            fnSendSocket('ZoneStatus', { deviceId, ZoneStatus })
          })
        break
      case 3003:
      case 3004:
      case 4001:
        fnSendSocket('deviceAll', {})
        break
      case 4002:
        const zone = result.Name.replace(/[^0-9]/g, '')
        const value = result.Controls[0].String
        let barixId = null
        if (value) {
          const updated = await dbBarix.findOne({ ipaddress: value })
          if (updated) {
            barixId = updated._id
          }
        }
        await dbQsys
          .updateOne(
            { deviceId, 'ZoneStatus.Zone': zone },
            { 'ZoneStatus.$.destination': barixId }
          )
          .exec()
        fnSendSocket('deviceAll', {})
        break
      case 4004:
        break
      default:
        logger.info(`ID evnet ${deviceId}, ${obj}, ${arr}`)
        if (Object.keys(result).includes('PageID')) {
          dbQsys
            .updateOne(
              { deviceId, 'PageStatus.idx': id },
              { 'PageStatus.$.PageID': result.PageID }
            )
            .exec()
          dbPage
            .updateOne(
              { 'idx': id, 'devices.deviceId': deviceId },
              { 'devices.$.PageID': result.PageID }
            )
            .exec()
        }
        break
    }
  } catch (error) {
    logger.error(`id parser error: ${error}`)
  }
}
