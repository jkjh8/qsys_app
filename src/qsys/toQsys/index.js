const qsys = require('..')
const logger = require('@logger')

const fnGetQsysStatus = (deviceId) => {
  try {
    qsys.obj[deviceId].addCommand({ id: 1000, method: 'StatusGet', params: {} })
  } catch (error) {
    logger.error(`Get Qsys status error -- ${error}`)
  }
}

const fnSetPaFeedback = (deviceId, value = true) => {
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

const fnGetVolumeMutes = (deviceId) => {
  try {
    const Controls = qsys.arr[
      qsys.arr.findIndex((e) => e.deviceId === deviceId)
    ].ZoneStatus.map((item) => ({
      Name: `zone.${item.Zone}.gain`,
      Name: `zone.${item.Zone}.mute`
    }))
    qsys.obj[deviceId].addCommand({
      id: 3001,
      method: 'Component.Get',
      params: { Name: 'PA', Controls }
    })
  } catch (error) {
    logger.error(`Get Volumes Mutes status error -- ${error}`)
  }
}

const fnSetVolumeolumeMutes = (deviceId) => {
  try {
    const Controls = qsys.arr[
      qsys.arr.findIndex((e) => e.deviceId === deviceId)
    ].ZoneStatus.map(
      (item) => ({
        Name: `zone.${item.Zone}.gain`,
        Value: item.gain
      }),
      {
        Name: `zone.${item.Zone}.mute`,
        Value: item.mute
      }
    )
    qsys.obj[deviceId].addCommand({
      id: 3003,
      method: 'Component.Set',
      params: { Name: 'PA', Controls }
    })
  } catch (error) {
    logger.error(`Set Volumes Mutes error -- ${error}`)
  }
}

const fnGetVolumeMute = (deviceId, zone) => {
  try {
    const Controls = [
      { Name: `zone.${zone}.gain` },
      { Name: `zone.${zone}.mute` }
    ]
    qsys.obj[deviceId].addCommand({
      id: 3001,
      method: 'Component.Get',
      params: { Name: 'PA', Controls }
    })
  } catch (error) {
    logger.error(`Get Volume Mute status error -- ${error}`)
  }
}

const fnSetVolume = (deviceId, zone, value) => {
  try {
    const zoneStatus = qsys.arr.find((e) => e.deviceId === deviceId).ZoneStatus[
      zone - 1
    ]
    zoneStatus.gain = value
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

const fnSetMute = (deviceId, zone, value) => {
  try {
    const zoneStatus = qsys.arr.find((e) => e.deviceId === deviceId).ZoneStatus[
      zone - 1
    ]
    zoneStatus.mute = value
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

const fnSetTransmitter = (args) => {
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

const fnSetTransmitters = (deviceId) => {
  const ZoneStatus =
    qsys.arr.find((e) => e.deviceId === deviceId)?.ZoneStatus || []
  ZoneStatus.forEach((item) => {
    const ipaddress = item.destination?.ipaddress || ''
    fnSetTransmitter({ deviceId, zone: item.Zone, ipaddress })
  })
}

const fnGetTransmitter = (deviceId, zone) => {
  qsys.obj[deviceId].addCommand({
    id: 4002,
    method: 'Component.Get',
    params: {
      Name: `Media_Stream_Transmitter_MS-TX-${zone}`,
      Controls: [{ Name: 'host' }]
    }
  })
}

const fnGetTransmitters = (deviceId) => {
  const ZoneStatus =
    qsys.arr.find((e) => e.deviceId === deviceId)?.ZoneStatus || []
  ZoneStatus.forEach((item) => {
    fnGetTransmitter(deviceId, item.Zone)
  })
}

const fnPaCancelAll = (deviceId) => {
  if (qsys.obj[deviceId]) {
    fnSetPaFeedback(deviceId, false)
    qsys.obj[deviceId].addCommand({
      id: 2009,
      method: 'Component.Set',
      params: {
        Name: 'PA',
        Controls: [{ Name: 'cancel.all.commands', Value: 1 }]
      }
    })
    fnSetPaFeedback(deviceId, true)
  }
}

module.exports = {
  fnGetQsysStatus,
  fnSetPaFeedback,
  fnGetVolumeMutes,
  fnSetVolumeolumeMutes,
  fnGetVolumeMute,
  fnSetVolume,
  fnSetMute,
  fnSetTransmitters,
  fnSetTransmitter,
  fnGetTransmitter,
  fnGetTransmitters,
  fnPaCancelAll
}
