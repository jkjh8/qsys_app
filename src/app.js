require('module-alias/register')
require('dotenv').config()
const logger = require('@logger')
const socket = require('./socket')
const { fnInitMulticast } = require('./multicast')
const { fnGetQsysFromDB } = require('./qsys/add')
require('./db')

try {
  logger.info('Q-Sys APP Started')
  // socket.connectIO()
  fnInitMulticast()
  fnGetQsysFromDB()
} catch (error) {
  logger.error(`Socket.io error: ${error}`)
}
