const qsys = require('@qsys')
const { fnSendSocket } = require('@api/socket')

module.exports = function parser(deviceId, arr) {
  let statusData = 0

  // console.log('fromQsys', deviceId, arr)
  for (let obj of arr) {
    // error
    if (Object.keys(obj).includes('error')) {
      return require('./error')(deviceId, obj)
    }

    // method
    if (Object.keys(obj).includes('method')) {
      let result = require('./method')(deviceId, obj)
      if (result) {
        statusData += 1
      }
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
      ZoneStatus: ZoneStatus.slice(0, statusData)
    })
    statusData = 0
  }
}
