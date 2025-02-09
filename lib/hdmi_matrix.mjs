import { SerialPort } from 'serialport';

export default class HDMI_Matrix {
  constructor(devicePath) {
    this.cbsOnce = [];
    // Create and configure the serial port
    this.port = new SerialPort({
      path: devicePath,
      baudRate: 9600,
      dataBits: 8,
      parity: 'none',
      stopBits: 1
    });

    // Event listener for successfully opening the port
    this.port.on('open', () => {
      console.log('Serial port opened successfully.');
    });

    // Event listener for incoming data
    this.port.on('data', (data) => {
      console.log('Received data:\n', data.toString());
      this.broadcastCbs(data)
    });

    // Event listener for errors
    this.port.on('error', (err) => {
      console.error('Error on serial port:', err.message);
    });

  }

  // Example method to send commands to the HDMI matrix
  write(sws) {
    // sws should be an array like [1, 2, 3, 4]
    const cmd = `PAP${sws[0]}P${sws[1]}P${sws[2]}P${sws[3]}`;
    console.log({event:"sending to switch", sws, cmd})
    this.port.write(cmd);
    this.port.flush();
  }
  broadcastCbs(data) {
    for(const cb of this.cbsOnce) {
        cb(data)
    }
    this.cbsOnce = []
  }
  parse(buf) {
    let st = buf.toString('utf8')
    let ich = st.indexOf("\rOK")
    if(ich >= 0) {
        let sws = [parseInt(st[ich+4]),
                    parseInt(st[ich+6]),
                    parseInt(st[ich+8]),
                    parseInt(st[ich+10])]
        return sws
    } else {
        return null
    }
  }
  read(cbOnce) {
    const cmd = "PAXXXXR"
    this.port.write(cmd);
    this.cbsOnce.push((data) => {
        let sws = this.parse(data)
        if(sws) {
            cbOnce({"event": "OK", "sws": sws})
        }
    })
  }
}
