const logger = require('@logger')
const qsys = require('@qsys')
const { fnSendSocket } = require('@api/socket')
const { fnGetVolumeMutes, fnGetTransmitters } = require('@qsys/toQsys')

module.exports = function parser(deviceId, arr) {
  let statusData = false
  for (let obj of arr) {
    // error
    if (Object.keys(obj).includes('error')) {
      return require('./error')(deviceId, obj)
    }

    // method
    if (Object.keys(obj).includes('method')) {
      statusData = require('./method')(deviceId, obj)
    }

    // id
    if (Object.keys(obj).includes('id')) {
      require('./id')(deviceId, obj, arr)
    }
  }
  if (statusData) {
    const ZoneStatus = qsys.arr.find((e) => e.deviceId === deviceId)?.ZoneStatus
    if (ZoneStatus) {
      const hasGain = ZoneStatus.some((item) => item.hasOwnProperty('gain'))
      if (!hasGain) {
        return fnGetVolumeMutes(deviceId)
      }
      fnSendSocket('qsys:device', {
        deviceId,
        data: {
          ZoneStatus
        }
      })
    }
  }
}
