const app = require('@app')

module.exports = {
  fnSendSocket: (key, value) => app.socket.emit(key, value)
}
