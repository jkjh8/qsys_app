const logger = require('@logger')
const qsys = require('@qsys')
const { fnAQs } = require('@qsys/add')
const {
  fnSTr,
  fnSetV,
  fnSetM,
  fnSTrs,
  fnGTrs,
  fnPACA
} = require('@qsys/toQsys')

const socketParser = (socket) => {
  socket.on('qsys:devices', (arr) => fnAQs(arr))
  socket.on('qsys:device:gtr', (obj) => fnSTr(obj))
  socket.on('qsys:volume', (obj) => fnSetV(obj.deviceId, obj.zone, obj.value))
  socket.on('qsys:mute', (obj) => fnSetM(obj.deviceId, obj.zone, obj.value))
  socket.on('qsys:device:gtrs', (obj) => fnGTrs(obj.deviceId))
  socket.on('qsys:device:strs', (obj) => fnSTrs(obj.device))
  socket.on('qsys:page:cancelAll', (deviceId) => fnPACA(deviceId))
}

module.exports = {
  socketParser
}
