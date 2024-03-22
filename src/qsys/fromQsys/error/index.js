const logger = require('@logger')
const { fnSendSocket } = require('@api/socket')

module.exports = (deviceId, obj) => {
  switch (obj.id) {
    case 3003:
    case 3004:
      //
      break
    default:
      //
      break
  }
  logger.error(`from Qsys Error ${deviceId} ${JSON.stringify(obj)}`)
  return fnSendSocket('qsys:error', obj)
}
