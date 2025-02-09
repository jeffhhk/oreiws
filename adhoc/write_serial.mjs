//const sys = require('sys')
import {SerialPort} from 'serialport';

const dev0 = '/dev/serial/by-id/usb-FTDI_USB_Serial_Converter_FTB6SPL3-if00-port0'
const port = new SerialPort({
  path: dev0,
  baudRate: 9600,  // 9600 baud rate
  dataBits: 8,     // 8 data bits
  parity: 'none',  // No parity
  stopBits: 1      // 1 stop bit
});

// Event listener for when the serial port is successfully opened.
port.on('open', () => {
  console.log('Serial port opened successfully.');
});

// Event listener for incoming data on the serial port.
port.on('data', (data) => {
  console.log('Received data:\n', data.toString());
});

// Event listener for any errors.
port.on('error', (err) => {
  console.error('Error on serial port:', err.message);
});


//port.write("PAXXXR")
port.write("PAP1P2P3P4")
port.flush()

// setTimeout(() =>
//   0 
// , 3000)