const qsys = require('@qsys')
// db
const dbQsys = require('@db/models/qsys')
const dbPage = require('@db/models/page')
// logger
const logger = require('@logger')
const { logEvent } = require('@api/logs')
//api
const { fnSendSocket } = require('@api/socket')
const { fnAmxRelayOff } = require('@api/amx')
const { fnBarixRelayOff } = require('@api/barix')

const { fnSendMulticast } = require('@multicast')
const { fnGetVolumeMutes } = require('@qsys/toQsys')

module.exports = function parser(deviceId, obj) {
  const { method, params } = obj
  try {
    switch (method) {
      case 'EngineStatus':
        dbQsys.updateOne({ deviceId }, { EngineStatus: params }).exec()
        dbQsys.findOne({ deviceId }).then((res) => {
          if (res.ZoneStatus && res.ZoneStatus.length) {
            const hasGain = res.ZoneStatus.some((item) =>
              item.hasOwnProperty('gain')
            )
            if (!hasGain) {
              fnGetVolumeMutes(deviceId)
            }
          }
        })
        break
      case 'PA.ZoneStatus':
        const ZoneStatus = qsys.arr.find(
          (item) => item.deviceId === deviceId
        )?.ZoneStatus
        const zoneIdx = ZoneStatus.findIndex(
          (item) => item.Zone === params.Zone
        )
        if (zoneIdx !== -1) {
          Object.assign(ZoneStatus[zoneIdx], params)
        } else {
          ZoneStatus.push(params)
        }
        return true
      case 'PA.PageStatus':
        const { State, PageID } = params
        if (State === 'done') {
          // 해당 페이지 찾기
          dbPage
            .findOne({ devices: { $elemMatch: { deviceId, PageID } } })
            .then(async (res) => {
              const current =
                res.devices[
                  res.devices.findIndex((e) => e.deviceId === deviceId)
                ]
              // 1초후에 릴레이 끄기
              setTimeout(async () => {
                await fnAmxRelayOff(current)
                await fnBarixRelayOff(current)
              }, 1000)

              // 방송 종료 로그
              logEvent(
                `방송 종료: ${res.name ?? ''} ${current.name ?? ''} idx: ${res.idx ?? ''} -PAGEID: ${PageID ?? ''}`,
                res.user,
                [current.name]
              )
              dbQsys.updateOne(
                { deviceId },
                { $pull: { PageStatus: { PageID } } }
              )
              fnSendMulticast('page:message', {
                deviceId,
                message: '방송 종료'
              })
            })
        }
        // 종료가 아니면 DB에 저장
        dbQsys
          .updateOne(
            { deviceId, 'PageStatus.PageID': PageID },
            { 'PageStatus.$': { ...params } }
          )
          .exec()
        break
      default:
        console.log('byMethod', deviceId, obj)
        break
    }
  } catch (error) {
    logger.error(`method parser error: ${error}`)
  }
}
