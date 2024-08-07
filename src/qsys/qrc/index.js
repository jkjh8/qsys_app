const EventEmitter = require('events').EventEmitter
const net = require('net')
const qsys = require('..')
// import { removeQsys } from '..'

module.exports = class Qrc extends EventEmitter {
  constructor(obj) {
    super()
    this.name = `${obj.name} - ${obj.ipaddress}`
    // tcp socket
    this.ipaddress = obj.ipaddress
    this.client = new net.Socket()
    this.ivConnection = null
    this.ivReconnect = null
    this.timeout = 60
    this.connected = false
    this.setDisconnect = false
    // commands
    this.commands = []
    this.ivCommands = null
    // data
    this.data = Buffer.alloc(0)

    // events
    this.client.on('connect', () => {
      this.connected = true
      this.emit('connect')
      // socket keep alive
      this.setTimeout()
      if (this.ivReconnect) {
        clearInterval(this.ivReconnect)
        this.ivReconnect = null
      }
    })

    this.client.on('close', () => {
      this.connected = false
      clearInterval(this.ivConnection)
      this.ivConnection = null
      this.client.removeAllListeners()
      // if (!this.setDisconnect) {
      //   this.reconnect()
      // }
      this.emit('disconnect')
    })

    this.client.on('timeout', () => {
      this.emit('error', `qsys qrc ${this.name} connection timeout`)
    })

    this.client.on('error', (err) => {
      this.client.end()
      this.emit('error', `qsys error -- ${err}`)
    })

    this.client.on('data', (data) => {
      try {
        this.data = Buffer.concat([this.data, data])
        if (data.includes('\x00')) {
          const _data = this.data
            .toString()
            .trim()
            .split('\x00')
            .filter((element) => {
              return element !== undefined && element !== null && element !== ''
            })
            .map((el) => JSON.parse(el))
          // emit data
          this.emit('data', _data)
          // reset buffer
          this.data = Buffer.alloc(0)
        }
      } catch (err) {
        this.emit(
          'error',
          `qsys qrc ${this.name} data receive error -- ${(err, data)}`
        )
      }
    })
  }

  connect() {
    if (this.connected) {
      return this.emit('error', `qsys qrc ${this.name} is already connected`)
    }
    try {
      this.client.connect({ port: 1710, host: this.ipaddress })
    } catch (err) {
      this.emit('error', `qsys qrc ${this.name} connect error -- ${err}`)
    }
  }

  disconnect() {
    try {
      if (this.ivCommands) {
        clearInterval(this.ivCommands)
      }
      if (this.ivConnection) {
        clearInterval(this.ivConnection)
      }
      this.ivCommands = null
      this.ivConnection = null

      if (this.connected) {
        this.client.end()
      }
    } catch (error) {
      this.emit('error', `qsys qrc disconnect error ${error}`)
    }
  }

  addCommand(msg) {
    try {
      this.commands.push(msg)
      if (!this.ivCommands) {
        this.commandProcess()
      }
    } catch (error) {
      this.emit('error', `qsys qrc add command error ${error}`)
    }
  }

  commandProcess() {
    try {
      this.ivCommands = setInterval(() => {
        if (this.commands.length > 0) {
          if (this.connected) {
            this.send(this.commands.shift())
          }
        } else {
          clearInterval(this.ivCommands)
          this.ivCommands = null
        }
      }, 100)
    } catch (error) {
      this.emit('error', `qsys qrc command process error ${error}`)
    }
  }

  send(msg) {
    try {
      if (this.connected) {
        this.client.write(
          JSON.stringify({
            jsonrpc: '2.0',
            ...msg
          }) + '\x00'
        )
        this.timeout = 60
      } else {
        this.emit(
          'error',
          `qsys qrc ${this.name} send data failed -- socket not connected command: ${msg}`
        )
      }
    } catch (error) {
      this.emit('error', `qsys qrc send command error ${error}`)
    }
  }

  setTimeout() {
    if (this.ivConnection) {
      return this.emit(
        'error',
        `qsys qrc ${this.name} set connection timeout failed -- timeout interval is alive`
      )
    } else {
      try {
        this.ivConnection = setInterval(() => {
          this.timeout = this.timeout - 1
          if (this.timeout < 5) {
            // this.addCommand({ method: 'NoOp', params: {} })
            // this.emit('debug', `qsys qrc ${this.name} -- noOp`)
            //get volume and mute status
            const Controls = []
            const current =
              qsys.arr[
                qsys.arr.findIndex((e) => e.ipaddress === this.ipaddress)
              ]
            if (current && current.ZoneStatus) {
              for (let zone of current.ZoneStatus) {
                Controls.push({ Name: `zone.${zone.Zone}.gain` })
                Controls.push({ Name: `zone.${zone.Zone}.mute` })
              }
              this.addCommand({
                id: 3001,
                method: 'Component.Get',
                params: { Name: 'PA', Controls }
              })
            }
          }
          // clear interval at disconnected
          if (!this.connected) {
            clearInterval(this.ivConnection)
            this.ivConnection = null
            this.emit(
              'error',
              `qsys qrc ${this.name} clear interval -- socket not connected`
            )
          }
        }, 1000)
      } catch (error) {
        this.emit(
          'error',
          `qsys qrc ${this.name} connection check error -- ${this.name}`
        )
      }
    }
  }
}
