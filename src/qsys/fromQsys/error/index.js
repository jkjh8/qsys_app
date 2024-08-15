const logger = require('@logger')
const { logError } = require('@api/logs')
const { fnSendSocket } = require('@api/socket')

module.exports = (deviceId, obj) => {
  switch (obj.id) {
    case 3003:
    case 3004:
      //
      break
    default:
      logError(`디바이스 오류 ${deviceId} ${obj}`, 'QSYS')
      break
  }
  logError(`디바이스 오류 ${deviceId} ${obj}`, 'QSYS')
}
