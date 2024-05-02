const qsys = require('..')
const logger = require('@logger')
const { fnSetPaFB } = require('../toQsys')

const fnSetLive = (arr) => {
  for (item of arr) {
    console.log(item)
    const { idx, deviceId, params } = item
    fnSetPaFB(deviceId, false)
    qsys.obj[deviceId].addCommand({
      id: idx,
      method: 'PA.PageSubmit',
      params: { ...params, Start: true }
    })
    fnSetPaFB(deviceId, true)
  }
}

module.exports = {
  fnSetLive
}
