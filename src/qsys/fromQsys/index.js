const logger = require('@logger')
const qsys = require('@qsys')
const dbQsys = require('@db/models/qsys')
// const { fnSendSocket } = require('@api/socket')
const { fnGetVolumeMutes, fnGetTransmitters } = require('@qsys/toQsys')
const { fnSendMulticastZoneStatus } = require('@multicast')

module.exports = function parser(deviceId, arr) {
  let statusData = false
  // console.log('fromQsys', deviceId, arr)
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
    if (ZoneStatus && ZoneStatus.length) {
      // const hasGain = ZoneStatus.some((item) => item.hasOwnProperty('gain'))
      // if (!hasGain) {
      //   consoel.log('get volume mutes')
      //   return fnGetVolumeMutes(deviceId)
      // }
      fnSendMulticastZoneStatus(deviceId, ZoneStatus)
    }
  }
}
