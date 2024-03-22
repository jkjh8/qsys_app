const qsys = require('@qsys')
const logger = require('@logger')
const { fnSendSocket } = require('@api/socket')

module.exports = function parser(deviceId, obj, arr) {
  try {
    const { id, result } = obj
    switch (id) {
      case 1000:
        fnSendSocket('qsys:device', {
          deviceId,
          data: { EngineStatus: result }
        })
        break
      case 2000:
        fnSendSocket('qsys:device', {
          deviceId,
          data: {
            ZoneStatusConfigure: result,
            channel: arr.length - 1,
            ZoneStatus:
              qsys.arr[qsys.arr.findIndex((item) => item.deviceId === deviceId)]
                .ZoneStatus
          }
        })
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
        const vols = result.Conteols
        const ZoneStatus =
          qsys.arr[qsys.arr.findIndex((item) => item.deviceId === deviceId)]
            .ZoneStatus
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
        break
      case 3003:
      case 3004:
        break
    }
  } catch (error) {
    logger.error(`id parser error: ${error}`)
  }
}
