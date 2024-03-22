const qsys = require('@qsys')
const logger = require('@logger')
const { fnSendSocket } = require('@api/socket')

module.exports = function parser(deviceId, obj) {
  const { method, params } = obj
  try {
    switch (method) {
      case 'EngineStatus':
        fnSendSocket('qsys:device', {
          deviceId,
          data: { EngineStatus: params }
        })
        break
      case 'PA.ZoneStatus':
        const ZoneStatus =
          qsys.arr[qsys.arr.findIndex((item) => item.deviceId === deviceId)]
            .ZoneStatus
        const zoneIdx = ZoneStatus.findIndex(
          (item) => item.Zone === params.Zone
        )
        if (zoneIdx !== -1) {
          for (let key in params) {
            ZoneStatus[zoneIdx][key] = params[key]
          }
        } else {
          ZoneStatus.push(params)
        }
        return true
    }
  } catch (error) {
    logger.error(`method parser error: ${error}`)
  }
}
