const qsys = require('@qsys')
// db
const dbQsys = require('@db/models/qsys')
const dbPage = require('@db/models/page')
// logger
const logger = require('@logger')
const { logEvent } = require('@api/logs')
//api
const { fnSendSocket } = require('@api/socket')
const { fnAmxRelayOff } = require('@api/amx')
const { fnBarixRelayOff } = require('@api/barix')
const { fnGetVolumeMutes } = require('@qsys/toQsys')
const { fn } = require('moment')

module.exports = function parser(deviceId, obj) {
  const { method, params } = obj
  try {
    switch (method) {
      case 'EngineStatus':
        dbQsys.updateOne({ deviceId }, { EngineStatus: params }).exec()
        dbQsys.findOne({ deviceId }).then((res) => {
          if (res.ZoneStatus && res.ZoneStatus.length) {
            const hasGain = res.ZoneStatus.some((item) =>
              item.hasOwnProperty('gain')
            )
            if (!hasGain) {
              fnGetVolumeMutes(deviceId)
            }
          }
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
          ZoneStatus[zoneIdx] = { ...ZoneStatus[zoneIdx], ...params }
        } else {
          if (params.Zone && params.Zone !== undefined) {
            ZoneStatus.push(params)
          }
        }
        return true
      case 'PA.PageStatus':
        fnSendSocket('page:status', { deviceId, ...params })
        break

      default:
        // console.log('byMethod', deviceId, obj)
        break
    }
  } catch (error) {
    logger.error(`method parser error: ${error}`)
  }
}
