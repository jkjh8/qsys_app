const qsys = require('@qsys')
const dbQsys = require('@db/models/qsys')
const dbPage = require('@db/models/page')
const dbBarix = require('@db/models/barix')
const logger = require('@logger')
const { fnSendSocket } = require('@api/socket')
const { fnSetTransmitter, fnGetTransmitter } = require('@qsys/toQsys')
const { fnSendMulticast, fnSendMulticastZoneStatus } = require('@multicast')

module.exports = async function parser(deviceId, obj, arr) {
  try {
    const { id, result } = obj
    let ZoneStatus = []
    switch (id) {
      case 1000:
        dbQsys.updateOne({ deviceId }, { EngineStatus: result }).exec()
        // fnSendMulticast('device', { deviceId, EngineStatus: result })
        // fnSendSocket('qsys:device', {
        //   deviceId,
        //   data: { EngineStatus: result }
        // })
        break
      case 2000:
        if (result) {
          const idx = qsys.arr.findIndex((item) => item.deviceId === deviceId)
          const ZoneStatus = qsys.arr[idx].ZoneStatus
          // const channel = arr.length - 1
          dbQsys
            .updateOne({ deviceId }, { ZoneStatus, ZoneStatusConfigure: true })
            .exec()
          // fnSendSocket('qsys:device', {
          //   deviceId,
          //   data: {
          //     ZoneStatusConfigure: result,
          //     channel,
          //     ZoneStatus
          //   }
          // })
        } else {
          dbQsys.updateOne({ deviceId }, { ZoneStatusConfigure: false }).exec()
          // fnSendSocket('qsys:device', {
          //   deviceId,
          //   data: {
          //     ZoneStatusConfigure: result
          //   }
          // })
        }
        break
      case 2001:
        dbQsys.updateOne({ deviceId }, { PaConfig: result }).exec()
        // fnSendSocket('qsys:device', { deviceId, data: { PaConfig: result } })
        break
      case 2002:
        // fnSendSocket('qsys:page:message', { deviceId, result })
        break
      case 2003:
        // fnSendSocket('qsys:page:live', { deviceId, result })
        break
      case 2008:
        // fnSendSocket('qsys:page:stop', { deviceId })
        break
      case 2009:
        // fnSendSocket('qsys:page:cancel', { deviceId })
        break
      case 3001:
        const vols = result.Controls
        const idx = qsys.arr.findIndex((item) => item.deviceId === deviceId)
        const ZoneStatus = qsys.arr[idx].ZoneStatus

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
        // db update & send multicast
        fnSendMulticastZoneStatus(deviceId, ZoneStatus)
        break
      case 3003:
      case 3004:
      case 4001:
        fnSendMulticast('deviceAll', {})
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
        fnSendMulticast('deviceAll', {})
        // fnSendSocket('qsys:get:tr', { deviceId, zone, value })
        break
      case 4004:
        break
      default:
        console.log('byID', deviceId, obj, arr)
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
          // fnSendSocket('qsys:page:id', {
          //   deviceId,
          //   idx: id,
          //   PageID: result.PageID
          // })
        }
        break
    }
  } catch (error) {
    logger.error(`id parser error: ${error}`)
  }
}
