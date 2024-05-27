const logger = require('@logger')
const qsys = require('@qsys')
const { fnSendSocket } = require('@api/socket')
const { fnGetVnMs, fnGTrs } = require('@qsys/toQsys')
module.exports = function parser(deviceId, arr) {
  let statusData = false
  for (let obj of arr) {
    // console.log(obj)
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
    const ZoneStatus =
      qsys.arr[qsys.arr.findIndex((e) => e.deviceId === deviceId)].ZoneStatus
    for (let item of ZoneStatus) {
      if (!item.hasOwnProperty('gain')) {
        return fnGetVnMs(deviceId)
      }
    }
    fnSendSocket('qsys:device', {
      deviceId,
      data: {
        ZoneStatus
      }
    })
  }
}
