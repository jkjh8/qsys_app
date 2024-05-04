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
const {
  fnSetLive,
  fnSetMessage,
  fnPageStop,
  fnPageSingleStop,
  fnPageCancel
} = require('@qsys/broadcast')

const socketParser = (socket) => {
  socket.on('qsys:devices', (arr) => fnAQs(arr))
  socket.on('qsys:device:gtr', (obj) => fnSTr(obj))
  socket.on('qsys:volume', (obj) => fnSetV(obj.deviceId, obj.zone, obj.value))
  socket.on('qsys:mute', (obj) => fnSetM(obj.deviceId, obj.zone, obj.value))
  socket.on('qsys:device:gtrs', (obj) => fnGTrs(obj.deviceId))
  socket.on('qsys:device:strs', (obj) => fnSTrs(obj.device))
  socket.on('qsys:page:cancelAll', (deviceId) => fnPACA(deviceId))
  socket.on('qsys:page:live', (arr) => fnSetLive(arr))
  socket.on('qsys:page:message', (arr) => fnSetMessage(arr))
  socket.on('qsys:page:stop', (arr) => fnPageStop(arr))
  socket.on('qsys:page:sstop', (obj) => fnPageSingleStop(obj))
  socket.on('qsys:page:cancel', (obj) => fnPageCancel(obj))
}

module.exports = {
  socketParser
}
