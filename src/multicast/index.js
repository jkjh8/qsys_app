const dgram = require('dgram')
const logger = require('@logger')

const address = '239.1.2.3'
const port = 9998
let socket = dgram.createSocket({ type: 'udp4', reuseAddr: true })

function fnInitMulticast() {
  socket.on('message', (msg, rinfo) => {
    console.log(msg.toString().trim())
  })
  socket.on('listening', () => {
    socket.setBroadcast(true)
    socket.setMulticastTTL(128)
    socket.addMembership(address)
    logger.info(`Server is listening on ${address}:${port}`)
  })
  socket.bind(port)
}

function fnSendMulticast(msg) {
  let jsonMsg = JSON.stringify(msg)
  socket.send(jsonMsg, 0, jsonMsg.length, port, address, (err) => {
    if (err) {
      console.error(err)
    }
  })
}

module.exports = {
  fnInitMulticast,
  fnSendMulticast
}
