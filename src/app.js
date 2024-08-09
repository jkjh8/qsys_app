require('module-alias/register')
const logger = require('@logger')
const socket = require('./socket')
const { fnInitMulticast } = require('./multicast')

try {
  logger.info('Q-Sys APP Started')
  socket.connectIO()
  fnInitMulticast()
} catch (error) {
  logger.error(`Socket.io error: ${error}`)
}
