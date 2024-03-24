const socket = require('@socket')

module.exports = {
  fnSendSocket: (key, value) => socket.socket.emit(key, value)
}
