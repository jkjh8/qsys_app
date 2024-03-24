const qsys = require('..')
const logger = require('@logger')

const fnGetQsysStatus = (deviceId) => {
  try {
    qsys.obj[deviceId].addCommand({ id: 1000, method: 'StatusGet', params: {} })
  } catch (error) {
    logger.error(`Get Qsys status error -- ${error}`)
  }
}

const fnSetPaFB = (deviceId, value = true) => {
  try {
    qsys.obj[deviceId].addCommand({
      id: 2000,
      method: 'PA.ZoneStatusConfigure',
      params: { Enabled: value }
    })
  } catch (error) {
    logger.error(`set qsys pa feedback -- ${error}`)
  }
}

const fnGetVnM = (deviceId) => {
  try {
    const Controls = []
    const ZoneStatus =
      qsys.arr[qsys.arr.findIndex((e) => e.deviceId === deviceId)].ZoneStatus
    for (let item of ZoneStatus) {
      Controls.push({ Name: `zone.${item.Zone}.gain` })
      Controls.push({ Name: `zone.${item.Zone}.mute` })
    }
    qsys.obj[deviceId].addCommand({
      id: 3001,
      method: 'Component.Get',
      params: { Name: 'PA', Controls }
    })
  } catch (error) {
    logger.error(`Get Volume Mute status error -- ${error}`)
  }
}

const fnSetV = (deviceId, zone, value) => {
  try {
    qsys.arr[qsys.arr.findIndex((e) => e.deviceId === deviceId)].ZoneStatus[
      zone
    ].gain = value
    qsys.obj[deviceId].addCommand({
      id: 3003,
      method: 'Component.Set',
      params: {
        Name: 'PA',
        Controls: [{ Name: `zone.${zone}.gain`, Value: value }]
      }
    })
  } catch (error) {
    logger.error(`Set Volume error -- ${error}`)
  }
}

const fnSetM = (deviceId, zone, value) => {
  try {
    qsys.arr[qsys.arr.findIndex((e) => e.deviceId === deviceId)].ZoneStatus[
      zone
    ].mute = value
    qsys.obj[deviceId].addCommand({
      id: 3004,
      method: 'Component.Set',
      params: {
        Name: 'PA',
        Controls: [{ Name: `zone.${zone}.mute`, Value: value }]
      }
    })
  } catch (error) {
    logger.error(`Set Mute error -- ${error}`)
  }
}

const fnSTr = (args) => {
  const { deviceId, zone, ipaddress } = args
  qsys.obj[deviceId].addCommand({
    id: 4001,
    method: 'Component.Set',
    params: {
      Name: `Media_Stream_Transmitter_MS-TX-${zone}`,
      Controls: [
        { Name: 'host', Value: ipaddress },
        { Name: 'port', Value: 4444 }
      ]
    }
  })
}

const fnSTrs = (device) => {
  const { deviceId, ZoneStatus } = device
  for (let item of ZoneStatus) {
    fnSTr({
      deviceId,
      zone: item.Zone,
      ipaddress:
        item.destination && item.destination.ipaddress
          ? item.destination.ipaddress
          : ''
    })
  }
}

const fnGTr = (args) => {
  const { deviceId, zone } = args
  qsys.obj[deviceId].addCommand({
    id: 4002,
    method: 'Component.Get',
    params: {
      Name: `Media_Stream_Transmitter_MS-TX-${zone}`,
      Controls: [{ Name: 'host' }]
    }
  })
}

const fnGTrs = (deviceId) => {
  const ZoneStatus =
    qsys.arr[qsys.arr.findIndex((e) => e.deviceId === deviceId)].ZoneStatus
  for (let item of ZoneStatus) {
    fnGTr({ deviceId, zone: item.Zone })
  }
}

module.exports = {
  fnGetQsysStatus,
  fnSetPaFB,
  fnGetVnM,
  fnSetV,
  fnSetM,
  fnSTrs,
  fnSTr,
  fnGTr,
  fnGTrs
}
