const dgram = require('dgram')
const dbQsys = require('@db/models/qsys')
const { logError } = require('@api/logs')

//A01 릴레이 여러개 구동
const fnAmxesRelayOn = async (devices) => {
  return Promise.all(
    devices.map(async (device) => {
      await fnAmxRelayOn(device)
    })
  )
}
//A02 단일 릴레이 구동
const fnAmxRelayOn = (device) => {
  return new Promise((resolve, reject) => {
    if (device.amx) {
      const udp = dgram.createSocket('udp4')
      udp.send(
        `#on,${device.params.Zones.join(',')}!`,
        9000,
        device.amx,
        (error) => {
          if (error) {
            logError(`A02 AMX 릴레이 켜기 ${device.name} - ${error}`, 'server')
            reject(error)
          }
          udp.close()
          resolve()
        }
      )
    }
    resolve()
  })
}

//A03 릴레이 끄기
const fnAmxRelayOff = async (device) => {
  try {
    const checkDevice = await dbQsys.findOne({ deviceId: device.deviceId })
    const ZoneStatus = checkDevice.ZoneStatus
    const Zones = device.params.Zones
    const active = Zones.filter((zone) => !ZoneStatus[zone - 1].Active)
    if (device.amx) {
      const udp = dgram.createSocket('udp4')
      udp.send(`#off,${active.join(',')}!`, 9000, device.amx, (error) => {
        if (error) {
          logError(`A03 AMX 릴레이 끄기 ${device.name} - ${error}`, 'server')
          throw error
        }
        udp.close()
      })
    }
  } catch (error) {
    logError(`A03 AMX 릴레이 끄기 ${error}`, 'server')
  }
}

module.exports = {
  fnAmxesRelayOn,
  fnAmxRelayOn,
  fnAmxRelayOff
}
