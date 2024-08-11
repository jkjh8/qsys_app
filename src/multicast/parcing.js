const logger = require('@logger')
const qsys = require('@qsys')
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
  fnSetLive,
  fnSetMuteessage,
  fnPageStop,
  fnPageSingleStop,
  fnPageCancel
} = require('@qsys/broadcast')

const fnMulticastParser = (key, value) => {
  switch (key) {
    case 'qsys:device:str':
      fnSetTransmitter(value)
      break
    case 'qsys:volume':
      fnSetVolume(value.deviceId, value.zone, value.value)
      break
    case 'qsys:mute':
      fnSetMute(value.deviceId, value.zone, value.value)
      break
    case 'qsys:device:gtrs':
      fnGetTransmitters(value.deviceId)
      break
    case 'qsys:device:strs':
      fnSetTransmitters(value.deviceId)
      break
    case 'qsys:page:cancelAll':
      console.log(value)
      fnPaCancelAll(value)
      break
    case 'qsys:page:live':
      fnSetLive(value)
      break
    case 'qsys:page:message':
      fnSetMuteessage(value)
      break
    case 'qsys:page:stop':
      console.log(value)
      fnPageStop(value)
      break
    case 'qsys:page:sstop':
      fnPageSingleStop(value)
      break
    case 'qsys:page:cancel':
      console.log(value)
      fnPageCancel(value)
      break
    case 'zone:set:channel':
      const { deviceId, Zone, gain, mute, destination } = value
      fnSetVolume(deviceId, Zone, gain)
      fnSetMute(deviceId, Zone, mute)
      if (destination) {
        fnSetTransmitter({
          deviceId,
          Zone,
          destination
        })
      }
      break
    case 'zone:set:device':
      fnSetTransmitters(value)
      fnSetVolumeMutes(value)
      console.log(value)
      break
    case 'zone:get:active':
      fnSetPaFeedback(value)
      break

    case 'getAll':
      // 지연 로딩을 사용하여 순환 종속성 문제 해결
      const { fnGetQsysFromDB } = require('@qsys/add')
      fnGetQsysFromDB()
      break
    default:
      logger.warn(`Unknown key: ${key}`)
  }
}

module.exports = {
  fnMulticastParser
}
