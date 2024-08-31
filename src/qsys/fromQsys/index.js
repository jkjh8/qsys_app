const qsys = require('@qsys')
const { fnSendSocket } = require('@api/socket')

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
    fnSendSocket('ZoneStatus', {
      deviceId,
      ZoneStatus: ZoneStatus
    })
    statusData = false
  }
}
