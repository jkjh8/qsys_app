const { io } = require('socket.io-client')
const { fnAQs } = require('@qsys')
const logger = require('@logger')
const { fnUpdateSocket } = require('@api/socket')
let socket

const connectSocket = () => {
  try {
    socket = io('http://localhost:3000/qsys', {
      transports: ['websocket'],
      autoConnect: true
    })

    socket.on('connect', () => {
      logger.info('Socket.io connected')
      fnUpdateSocket(socket)
    })

    socket.on('disconnect', () => {
      logger.warn('Socket.io disconnected')
    })
    // functions
    socket.on('qsys:devices', (arr) => {
      try {
        fnAQs(arr)
        logger.info(`Qsys devices updated: ${arr.length}`)
      } catch (error) {
        logger.error(`Qsys devices update error: ${error}`)
      }
    })
    logger.info('Socket.io started')
  } catch (error) {
    logger.error(`Socket.io connection error: ${error}`)
  }
}

module.exports = { connectSocket, socket }
