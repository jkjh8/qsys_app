require('module-alias/register')
require('dotenv').config()
const logger = require('@logger')
const socket = require('./socket')
const { fnGetQsysFromDB } = require('./qsys/add')
require('./db')

try {
  logger.info('Q-Sys APP Started')
  socket.connectIO()
  fnGetQsysFromDB()
} catch (error) {
  logger.error(`Socket.io error: ${error}`)
}
