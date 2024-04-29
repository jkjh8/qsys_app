const qsys = require('..')
const logger = require('@logger')

const fnSetLive = (arr) => {
  for (item of arr) {
    console.log(item)
    const { id, deviceId, params } = item
    qsys.obj[deviceId].addCommand({
      id,
      method: 'PA.PageSubmit',
      params: { ...params, Start: true }
    })
  }
}

module.exports = {
  fnSetLive
}
