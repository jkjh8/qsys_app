const { io } = require('socket.io-client')
const logger = require('@logger')
exports.connectIO = () => {
  console.log('start connect')
  const socket = io.connect('https://localhost:3443/qsys', {
    secure: true,
    withCredentials: true,
    rejectUnauthorized: false,
    extraHeaders: {
      auth: 'qsys'
    }
  })

  socket.on('connect', () => {
    logger.info('Socket.io connected')
  })

  socket.on('connect_error', (err) => {
    logger.error('Socket.io connect_error', err)
  })

  socket.on('disconnect', () => {
    logger.info('Socket.io disconnected')
  })

  require('./fromSocket')(socket)

  //return
  exports.socket = socket
}
