require('module-alias/register')
const logger = require('@logger')
const socket = require('./socket')

try {
  logger.info('Q-Sys APP Started')
  socket.connectIO()
} catch (error) {
  logger.error(`Socket.io error: ${error}`)
}
