require('module-alias/register')
const logger = require('@logger')
const { io } = require('socket.io-client')
const { fnAQs } = require('@qsys/add')
const qsys = require('./qsys')
let socket

try {
  socket = io('http://localhost:3000/qsys', {
    transports: ['websocket'],
    autoConnect: true
  })

  socket.on('connect', () => {
    logger.info('Socket.io connected')
  })

  socket.on('disconnect', () => {
    logger.info('Socket.io disconnected')
  })

  socket.on('qsys:devices', (arr) => {
    try {
      fnAQs(arr)
      qsys.arr = arr
      logger.info(`Qsys devices updated: ${arr.length}`)
    } catch (error) {
      logger.error(`Qsys devices update error: ${error}`)
    }
  })
  logger.info('Socket.io started')
} catch (error) {
  logger.error(error)
}

exports.socket = socket
