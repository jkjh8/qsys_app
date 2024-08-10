const dgram = require('dgram')
const logger = require('@logger')
const dbQsys = require('@db/models/qsys')
const { fnMulticastParser } = require('./parcing')

const address = '239.129.129.12'
const port = 9998
let socket = dgram.createSocket({ type: 'udp4', reuseAddr: true })

function fnInitMulticast() {
  socket.on('message', (msg, rinfo) => {
    const { key, value } = JSON.parse(msg.toString().trim())
    fnMulticastParser(key, value)
    // console.log(msg.toString().trim())
  })
  socket.on('listening', () => {
    socket.setBroadcast(true)
    socket.setMulticastTTL(128)
    socket.addMembership(address)
    logger.info(`Server is listening on ${address}:${port}`)
  })
  socket.bind(port)
}

function fnSendMulticast(key, value) {
  let jsonMsg = JSON.stringify({ key, value })
  const buf = Buffer.from(jsonMsg)
  socket.send(buf, 0, buf.length, 9908, address, (err) => {
    if (err) {
      console.error(err)
    }
  })
}

const fnSendMulticastZoneStatus = (deviceId, ZoneStatus) => {
  dbQsys.updateOne({ deviceId }, { ZoneStatus }).exec()
  fnSendMulticast('ZoneStatus', { deviceId, ZoneStatus })
}

module.exports = {
  fnInitMulticast,
  fnSendMulticast,
  fnSendMulticastZoneStatus
}
