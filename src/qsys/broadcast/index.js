const qsys = require('..')
const logger = require('@logger')
const { fnSetPaFB } = require('../toQsys')

const fnSetLive = (arr) => {
  for (let item of arr) {
    console.log(item)
    const { idx, deviceId, params } = item
    fnSetPaFB(deviceId, false)
    qsys.obj[deviceId].addCommand({
      id: idx,
      method: 'PA.PageSubmit',
      params: { ...params }
    })
    fnSetPaFB(deviceId, true)
  }
}

const fnSetMessage = (arr) => {
  for (let item of arr) {
    console.log(item)
    const { idx, deviceId, params } = item
    fnSetPaFB(deviceId, false)
    qsys.obj[deviceId].addCommand({
      id: idx,
      method: 'PA.PageSubmit',
      params: { ...params }
    })
    fnSetPaFB(deviceId, true)
  }
}

const fnPageStop = (arr) => {
  for (item of arr) {
    const { deviceId, idx, PageID } = item
    qsys.obj[deviceId].addCommand({
      id: idx,
      method: 'PA.PageStop',
      params: { PageID }
    })
  }
}

const fnPageSingleStop = (obj) => {
  const { deviceId, PageID, idx } = obj
  fnSetPaFB(deviceId, false)
  qsys.obj[deviceId].addCommand({
    id: idx,
    method: 'PA.PageStop',
    params: { PageID }
  })
  fnSetPaFB(deviceId, true)
}

const fnPageCancel = (obj) => {
  const { deviceId, PageID, idx } = obj
  fnSetPaFB(deviceId, false)
  qsys.obj[deviceId].addCommand({
    id: idx,
    method: 'PA.PageCancel',
    params: { PageID }
  })
  fnSetPaFB(deviceId, true)
}

module.exports = {
  fnSetLive,
  fnPageStop,
  fnSetMessage,
  fnPageCancel,
  fnPageSingleStop
}
