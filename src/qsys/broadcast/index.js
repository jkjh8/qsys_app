const qsys = require('..')
const logger = require('@logger')
const { fnSetPaFeedback } = require('../toQsys')

const fnSetPage = (arr) => {
  try {
    arr.forEach((item) => {
      const { idx, deviceId, params } = item
      fnSetPaFeedback(deviceId, false)
      qsys.obj[deviceId].addCommand({
        id: idx,
        method: 'PA.PageSubmit',
        params: { ...params }
      })
      fnSetPaFeedback(deviceId, true)
    })
  } catch (error) {
    logger.error('fnSetPage', error)
  }
}

const fnSetLive = (arr) => {
  arr.forEach((item) => {
    const { idx, deviceId, params } = item
    fnSetPaFeedback(deviceId, false)
    qsys.obj[deviceId].addCommand({
      id: idx,
      method: 'PA.PageSubmit',
      params: { ...params }
    })
    fnSetPaFeedback(deviceId, true)
  })
}

const fnSetMessage = (arr) => {
  try {
    arr.forEach((item) => {
      const { idx, deviceId, params } = item
      fnSetPaFeedback(deviceId, false)
      qsys.obj[deviceId].addCommand({
        id: idx,
        method: 'PA.PageSubmit',
        params: { ...params }
      })
      fnSetPaFeedback(deviceId, true)
    })
  } catch (error) {
    logger.error('fnSetMessage', error)
  }
}

const fnPageStop = (arr) => {
  arr.forEach((item) => {
    const { deviceId, idx, PageID } = item
    fnSetPaFeedback(deviceId, false)
    qsys.obj[deviceId].addCommand({
      id: idx,
      method: 'PA.PageStop',
      params: { PageID }
    })
    fnSetPaFeedback(deviceId, true)
  })
}

const fnPageSingleStop = (obj) => {
  const { deviceId, PageID, idx } = obj
  fnSetPaFeedback(deviceId, false)
  qsys.obj[deviceId].addCommand({
    id: idx,
    method: 'PA.PageStop',
    params: { PageID }
  })
  fnSetPaFeedback(deviceId, true)
}

const fnPageCancel = (obj) => {
  const { deviceId, PageID, idx } = obj
  fnSetPaFeedback(deviceId, false)
  qsys.obj[deviceId].addCommand({
    id: idx,
    method: 'PA.PageCancel',
    params: { PageID }
  })
  fnSetPaFeedback(deviceId, true)
}

module.exports = {
  fnSetPage,
  fnSetLive,
  fnPageStop,
  fnSetMessage,
  fnPageCancel,
  fnPageSingleStop
}
