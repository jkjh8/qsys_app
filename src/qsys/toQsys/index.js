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

const fnGetVnMs = (deviceId) => {
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
    logger.error(`Get Volumes Mutes status error -- ${error}`)
  }
}

const fnSetVnMs = (deviceId) => {
  try {
    const Controls = []
    const ZoneStatus =
      qsys.arr[qsys.arr.findIndex((e) => e.deviceId === deviceId)].ZoneStatus
    for (let item of ZoneStatus) {
      Controls.push({ Name: `zone.${item.Zone}.gain`, Value: item.gain })
      Controls.push({
        Name: `zone.${item.Zone}.mute`,
        Value: item.mute
      })
    }
    qsys.obj[deviceId].addCommand({
      id: 3003,
      method: 'Component.Set',
      params: { Name: 'PA', Controls }
    })
  } catch (error) {
    logger.error(`Set Volumes Mutes error -- ${error}`)
  }
}

const fnGetVnM = (deviceId, zone) => {
  try {
    const Controls = []
    Controls.push({ Name: `zone.${zone}.gain` })
    Controls.push({ Name: `zone.${zone}.mute` })
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
      zone - 1
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
      zone - 1
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

const fnSTrs = (deviceId) => {
  const ZoneStatus =
    qsys.arr[qsys.arr.findIndex((e) => e.deviceId === deviceId)].ZoneStatus
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

const fnGTr = (deviceId, zone) => {
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
const fnPACA = (deviceId) => {
  if (qsys.obj[deviceId]) {
    fnSetPaFB(deviceId, false)
    qsys.obj[deviceId].addCommand({
      id: 2009,
      method: 'Component.Set',
      params: {
        Name: 'PA',
        Controls: [{ Name: 'cancel.all.commands', Value: 1 }]
      }
    })
    fnSetPaFB(deviceId, true)
  }
}

module.exports = {
  fnGetQsysStatus,
  fnSetPaFB,
  fnGetVnMs,
  fnSetVnMs,
  fnGetVnM,
  fnSetV,
  fnSetM,
  fnSTrs,
  fnSTr,
  fnGTr,
  fnGTrs,
  fnPACA
}
