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

// 전체 채널의 볼륨과 뮤트 상태를 설정
const fnSetVolumeolumeMutes = async (deviceId) => {
  try {
    // qsys 찾기
    const idx = qsys.arr.findIndex((e) => e.deviceId === deviceId)
    // qsys가 없으면 에러 출력
    if (idx === -1) return logger.error(`Device not found`)
    // qsys의 ZoneStatus를 Controls로 변환
    const Controls = []
    // Controls에 zone별 gain, mute 추가
    await Promise.all(
      qsys.arr[idx].ZoneStatus.map(async (item) => {
        Controls.push({
          Name: `zone.${item.Zone}.gain`,
          Value: item.gain
        })
        Controls.push({
          Name: `zone.${item.Zone}.mute`,
          Value: item.mute
        })
      })
    )
    // qsys에 명령 추가
    qsys.obj[deviceId].addCommand({
      id: 3003,
      method: 'Component.Set',
      params: { Name: 'PA', Controls }
    })
    // logger에 로그 출력
    logger.info(`Set Volumes Mutes success - ${deviceId}`)
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
  try {
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
  } catch (error) {
    logger.error(`Set Transmitter error -- ${error}`)
  }
}

const fnSetTransmitters = (deviceId) => {
  try {
    const ZoneStatus =
      qsys.arr.find((e) => e.deviceId === deviceId)?.ZoneStatus || []
    ZoneStatus.forEach((item) => {
      const ipaddress = item.destination?.ipaddress || ''
      fnSetTransmitter({ deviceId, zone: item.Zone, ipaddress })
    })
  } catch (error) {
    logger.error(`Set Transmitters error -- ${error}`)
  }
}

const fnGetTransmitter = (deviceId, zone) => {
  try {
    qsys.obj[deviceId].addCommand({
      id: 4002,
      method: 'Component.Get',
      params: {
        Name: `Media_Stream_Transmitter_MS-TX-${zone}`,
        Controls: [{ Name: 'host' }]
      }
    })
  } catch (error) {
    logger.error(`Get Transmitter error -- ${error}`)
  }
}

const fnGetTransmitters = (deviceId) => {
  try {
    const ZoneStatus =
      qsys.arr.find((e) => e.deviceId === deviceId)?.ZoneStatus || []
    ZoneStatus.forEach((item) => {
      fnGetTransmitter(deviceId, item.Zone)
    })
  } catch (error) {
    logger.error(`Get Transmitters error -- ${error}`)
  }
}

const fnPaCancelAll = (deviceId) => {
  try {
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
  } catch (error) {
    logger.error(`PA Cancel All error -- ${error}`)
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
