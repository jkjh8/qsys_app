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
        const ZoneStatus = qsys.arr.find(
          (item) => item.deviceId === deviceId
        )?.ZoneStatus
        const zoneIdx = ZoneStatus.findIndex(
          (item) => item.Zone === params.Zone
        )
        if (zoneIdx !== -1) {
          Object.assign(ZoneStatus[zoneIdx], params)
        } else {
          ZoneStatus.push(params)
        }
        return true
      case 'PA.PageStatus':
        fnSendSocket('qsys:page:status', {
          deviceId,
          params
        })
        break
      default:
        console.log('byMethod', deviceId, obj)
        break
    }
  } catch (error) {
    logger.error(`method parser error: ${error}`)
  }
}
