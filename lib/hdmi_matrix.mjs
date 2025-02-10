import { SerialPort } from 'serialport';
import pino from 'pino';
const logger = pino({
    timestamp: pino.stdTimeFunctions.isoTime
  });

/*
OREI UHD-404R HDMI Matrix Switch

    OREI manual says:
        https://cdn.shopify.com/s/files/1/1988/4253/files/UHD-404R.pdf?v=1673427815

        "mode one"
            PS23R - set input 3 to output 2

        "mode two"
            PAPXPXPXPX - set all inputs to XXXX

        read current state:
            PAXXXR - read status of all interfaces, returning
                OKPXPXPXPX - where XXXX is the set of all switches
                # But this command is an error.  See below.

    OREI device hands-on reveals:
        RS-232 specifics:
            HIGH = +5V
            LOW = 0V
            baud = 9600
            parity = none
            stop bits = 1

        all outputs preceeded by LF (0x0a)
        all outputs are suffixed by time delay, but no bytes
        on startup:
            Jul 05 2022 16:54:17

        "mode 2", change all channels at once:
            PAP1P2P3P4
                # output lights show 1,2,3,4
                OKP1P2P3P4

        "mode 1"
            PAP1P1P1P1
                OKP1P1P1P1
            PS14R
                OKP4P1P1P1

        "read"
            PAXXXXR
                OKP1P2P3P4
            PAXXXR
                ERR

        Reset
            OK�
            Jul 05 2022 16:54:17
*/
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
      logger.info({'event':'Serial port opened successfully.'});
    });

    // Event listener for incoming data
    this.port.on('data', (data) => {
      logger.info({'event':'Recieved data:\n', data:data.toString()});
      this.broadcastCbs(data)
    });

    // Event listener for errors
    this.port.on('error', (err) => {
      logger.error({'event':'Error on serial port:', msg:err.message});
    });

  }

  // Example method to send commands to the HDMI matrix
  write(sws) {
    // sws should be an array like [1, 2, 3, 4]
    const cmd = `PAP${sws[0]}P${sws[1]}P${sws[2]}P${sws[3]}`;
    logger.info({event:"sending to switch", sws, cmd})
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
