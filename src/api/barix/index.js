const { logInfo, logWarn, logError } = require('@api/logs')
const dbQsys = require('@db/models/qsys')
const dbBarix = require('@db/models/barix')
const axios = require('axios')
// const https = require('https')

const fnBarixRelayOff = async (device) => {
  try {
    const currentDevice = await dbQsys.findOne({ deviceId: device.deviceId })
    const ZoneStatus = currentDevice.ZoneStatus

    for (let i = 0; i < device.barix.length; i++) {
      if (device.barix[i] === null) return
      if (ZoneStatus[i].Active) return
      let ipaddress
      if (device.barix[i].ipaddress) {
        ipaddress = device.barix[i].ipaddress
      } else {
        const barix = await dbBarix.findOne({ _id: device.barix[i] })
        ipaddress = barix.ipaddress
      }
      // 릴레이 끄기
      try {
        await axios.get(`http://${ipaddress}/rc.cgi?R=0`, { timeout: 5000 })
      } catch (error) {
        logError(`B04 Barix 릴레이 끄기 ${JSON.stringify(error)}`, 'Q-SYS')
      }
    }
  } catch (error) {
    logError(`B04 Barix 릴레이 끄기 ${JSON.stringify(error)}`, 'Q-SYS')
  }
}

const fnBarixRelayOn = async (arr) => {
  try {
    await Promise.all(
      arr.map(async (device) => {
        if (!device) return
        let ipaddress
        // ipaddress 찾기
        if (device.ipaddress) {
          ipaddress = device.ipaddress
        } else {
          const barix = await dbBarixFindOne({ _id: device })
          ipaddress = barix.ipaddress
        }
        try {
          await axios.get(`http://${ipaddress}/rc.cgi?R=1`, { timeout: 5000 })
        } catch (error) {
          logError(`B04 Barix 릴레이 켜기 - ${JSON.stringify(error)}`, 'Q-SYS')
        }
      })
    )
  } catch (error) {
    logError(`B04 Barix 릴레이 켜기 - ${JSON.stringify(error)}`, 'Q-SYS')
  }
}

//B05 릴레이 제어 전체 Qsys 리스트
const fnBarixesRelayOn = async (devices) => {
  try {
    return await Promise.all(devices.map((zone) => fnBarixRelayOn(zone.barix)))
  } catch (error) {
    logError(`B05 Barix 릴레이 켜기 - ${JSON.stringify(error)}`, 'Q-SYS')
  }
}

const fnBarixesRelayOff = async (devices) => {
  try {
    return await Promise.all(devices.map((zone) => fnBarixRelayOff(zone.barix)))
  } catch (error) {
    logError(`B05 Barix 릴레이 끄기 - ${JSON.stringify(error)}`, 'Q-SYS')
  }
}

module.exports = {
  fnBarixRelayOn,
  fnBarixRelayOff,
  fnBarixesRelayOn,
  fnBarixesRelayOff
}
