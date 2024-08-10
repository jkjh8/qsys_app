const mongoose = require('mongoose')

const barixSchema = new mongoose.Schema(
  {
    name: String,
    idx: Number,
    deviceId: { type: String, unique: true },
    ipaddress: { type: String, unique: true },
    active: { type: Boolean, default: true },
    reconnect: { type: Number, default: 0 },
    port: { type: Number, default: 3030 },
    netmask: String,
    gateway: String,
    status: Boolean,
    macaddress: String,
    hwtype: Number,
    ipamtype: Number,
    codectype: Number,
    uptime: Number,
    volume: Number,
    shuffle: Boolean,
    repeat: Boolean,
    buffer: Number,
    streamnumber: Number,
    streamurl: String,
    channels: Number,
    birate: Number,
    mediaformat: String,
    rtpdelay: Number,
    rtpdelayave: Number,
    lasterror: String,
    url1: String,
    url2: String,
    url3: String,
    relay1: Number,
    relay2: Number,
    relay3: Number,
    relay4: Number,
    relay5: Number,
    relay6: Number,
    relay7: Number,
    relay8: Number,
    serialgatewayip: String,
    serialgatewayport: Number,
    serialgatewaymode: Number,
    serialgatewaybaudrate: Number,
    serialgatewayflow: Number
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Barix', barixSchema)
