const logger = require('@logger')
const qsys = require('@qsys')
const { fnAQs } = require('@qsys/add')
const {
  fnSetPaFeedback,
  fnSetTransmitter,
  fnGetVolumeMute,
  fnGetVolumeMutes,
  fnSetVolumeMutes,
  fnSetVolume,
  fnSetMute,
  fnSetTransmitters,
  fnGetTransmitters,
  fnGetTransmitter,
  fnPaCancelAll
} = require('@qsys/toQsys')

const {
  fnSetPage,
  fnSetLive,
  fnSetMessage,
  fnPageStop,
  fnPageSingleStop,
  fnPageCancel
} = require('@qsys/broadcast')

const socketParser = (socket) => {
  socket.on('qsys:devices', (data) => {
    try {
      if (typeof data === 'string') {
        data = JSON.parse(data)
      }
      if (typeof data === 'object') {
        fnAQs(data)
      }
    } catch (error) {
      logger.error(`Qsys devices error: ${error}`)
    }
  })
  socket.on('qsys:device', (obj) => {
    const idx = qsys.arr.findIndex((item) => item.deviceId === obj.deviceId)
    if (idx !== -1) {
      qsys.arr[idx] = obj
    }
  })
  socket.on('qsys:volume', (obj) =>
    fnSetVolume(obj.deviceId, obj.zone, obj.value)
  )
  socket.on('qsys:mute', (obj) => fnSetMute(obj.deviceId, obj.zone, obj.value))
  socket.on('qsys:device:gtrs', (obj) => fnGetTransmitters(obj.deviceId))
  socket.on('qsys:device:strs', (obj) => fnSetTransmitters(obj.deviceId))
  socket.on('qsys:device:str', (obj) => fnSetTransmitter(obj))
  socket.on('qsys:page:cancelAll', (deviceId) => fnPaCancelAll(deviceId))
  socket.on('qsys:page:live', (arr) => fnSetLive(arr))
  socket.on('qsys:page:message', (arr) => fnSetMessage(arr))
  socket.on('qsys:page', (arr) => fnSetPage(arr))
  socket.on('qsys:page:stop', (arr) => fnPageStop(arr))
  socket.on('qsys:page:sstop', (obj) => fnPageSingleStop(obj))
  socket.on('qsys:page:cancel', (obj) => fnPageCancel(obj))
  socket.on('zone:set:channel', (obj) => {
    const { deviceId, Zone, gain, mute, destination } = obj
    fnSetVolume(deviceId, Zone, gain)
    fnSetMute(deviceId, Zone, mute)
    if (destination) {
      fnSetTransmitter({
        deviceId,
        zone: Zone,
        ipaddress: destination.ipaddress
      })
    }
  })
  socket.on('zone:get:channels', (deviceId) => {
    fnGetVolumeMutes(deviceId)
  })
  socket.on('zone:set:device', (deviceId) => {
    fnSetVolumeMutes(deviceId)
    fnSetTransmitters(deviceId)
  })
  socket.on('zone:get:active', (deviceId) => {
    fnSetPaFeedback(deviceId, false)
    setTimeout(() => fnSetPaFeedback(deviceId, true), 500)
  })
}

module.exports = {
  socketParser
}
