const socket = require('@socket')

let queue = []
let commandIV = null

const commandProcess = () => {
  commandIV = setInterval(() => {
    if (queue.length > 0) {
      if (socket.socket.connected) {
        let { key, value } = queue.shift()
        socket.socket.emit(key, value)
      }
    } else {
      clearInterval(commandIV)
      commandIV = null
    }
  }, 0)
}

const fnSendSocket = (key, value) => {
  queue.push({ key, value })
  if (!commandIV) {
    commandProcess()
  }
}

module.exports = {
  fnSendSocket
}
