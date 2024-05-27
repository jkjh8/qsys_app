const qsys = require('@qsys')
const logger = require('@logger')
const { fnSendSocket } = require('@api/socket')
const { fnSTr, fnGTr } = require('@qsys/toQsys')

module.exports = function parser(deviceId, obj, arr) {
  try {
    const { id, result } = obj
    let ZoneStatus = []
    switch (id) {
      case 1000:
        fnSendSocket('qsys:device', {
          deviceId,
          data: { EngineStatus: result }
        })
        break
      case 2000:
        ZoneStatus =
          qsys.arr[qsys.arr.findIndex((item) => item.deviceId === deviceId)]
            .ZoneStatus
        // stream data receive
        // for (let item of ZoneStatus) {
        //   fnGTr({
        //     deviceId,
        //     zone: item.Zone,
        //     ipaddress:
        //       item.destination && item.destination.ipaddress
        //         ? item.ipaddress
        //         : null
        //   })
        // }
        // return data
        if (result) {
          fnSendSocket('qsys:device', {
            deviceId,
            data: {
              ZoneStatusConfigure: result,
              channel: arr.length - 1,
              ZoneStatus
            }
          })
        } else {
          fnSendSocket('qsys:device', {
            deviceId,
            data: {
              ZoneStatusConfigure: result
            }
          })
        }
        break
      case 2001:
        fnSendSocket('qsys:device', { deviceId, data: { PaConfig: result } })
        break
      case 2002:
        fnSendSocket('qsys:page:message', { deviceId, result })
        break
      case 2003:
        fnSendSocket('qsys:page:live', { deviceId, result })
        break
      case 2008:
        fnSendSocket('qsys:page:stop', { deviceId })
        break
      case 2009:
        fnSendSocket('qsys:page:cancel', { deviceId })
        break
      case 3001:
        const vols = result.Controls
        const idx = qsys.arr.findIndex((item) => item.deviceId === deviceId)
        ZoneStatus = qsys.arr[idx].ZoneStatus
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
        fnSendSocket('qsys:device', { deviceId, data: { ZoneStatus } })
        break
      case 3003:
      case 3004:
      case 4001:
        break
      case 4002:
        console.log(4002)
        const zone = result.Name.replace(/[^0-9]/g, '')
        const value = result.Controls[0].String
        console.log(deviceId, zone, value)
        fnSendSocket('qsys:rttr', { deviceId, zone, value })
        break
      case 4004:
        break
      default:
        console.log('byID', deviceId, obj, arr)
        if (Object.keys(result).includes('PageID')) {
          fnSendSocket('qsys:page:id', {
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
