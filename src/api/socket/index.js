const logger = require('@logger')

let socket = null

const fnSendSocket = (addr, value) => {
  socket.emit(addr, value)
}

const fnUpdateSocket = (obj) => {
  socket = obj
  logger.info('Socket.io updated')
}

module.exports = {
  fnSendSocket,
  fnUpdateSocket
}
