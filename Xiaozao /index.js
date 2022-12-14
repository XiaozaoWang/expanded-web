let express = require('express');
let webcam_mjpeg = require('./webcam_mjpeg');
let { SerialPort } = require('serialport');         // a module for talking serial
let app = express();
let port = 3000;
let arduino = null; 
let child_process = require('child_process');
const { isTypedArray } = require('util/types');

if (process.platform == 'darwin') {

  // Those are webcam options for macOS.
  var webcam_options = [
    '-f', 'avfoundation',
    '-framerate', '30',                      // needed
    '-video_size', '1280x720',               // optional: 1920x1080, 640x480 (default: largest)
    '-i', 'default',                         // which camera device (0, 1, ..)
    '-filter:v', 'fps=5',                    // optional: change framerate
    // '-filter:v', 'fps=10,scale=640x360',  // optional: resize output
    '-q:v', '20',                            // optional: quality (1=best, 31=worst)
  ];
}

webcam = webcam_mjpeg(app, '/live.mjpeg', webcam_options);



let positive_count = 0;
let negative_count = 0;




// ********************************************************************************************
app.all('/count/positive', function(req, res) {
  res.send(positive_count.toString());
});

app.all('/count/negative', function(req, res) {
  res.send(negative_count.toString());
});
// ********************************************************************************************




// app.all('/count', function(req, res) {
//   res.json({
//     'positive': positive_count,
//     'negative': negative_count
//   });
// });

app.all('/positive/*', function(req, res) {
  let out = req.params[0];
  console.log(req.ip + ' receives: ' + out);
  child_process.spawn('say', ['from' + req.ip + ' ' + out] );
  positive_count++;
  console.log(positive_count, negative_count);

  if (arduino) {                                    // if we have an open serial connection:
    arduino.write('1\n');                      // send what we got from the browser
    console.log(req.ip + ' made me send to Arduino: 1');
  } else {
    console.log('No Arduino connected');
  }
  res.end();
});

app.all('/negative/*', function(req, res) {
  let out = req.params[0];
  console.log(req.ip + ' receives: ' + out);
  child_process.spawn('say', ['from' + req.ip + ' ' + out] );
  negative_count++;
  console.log(positive_count, negative_count);

  if (arduino) {                                    // if we have an open serial connection:
    arduino.write('0\n');                      // send what we got from the browser
    console.log(req.ip + ' made me send to Arduino: 0');
  } else {
    console.log('No Arduino connected');
  }
  res.end();
});


app.use(express.static('public'));           // html

tryConnectArduino();

app.listen(port, function() {
  console.log('Example app listening at http://localhost:' + port);
})






async function tryConnectArduino() {
  if (arduino && arduino.isOpen)
    return;  // port is already open
  let port = await getArduino();
  if (port) {
    arduino = new SerialPort({
      path: port.path,
      baudRate: 9600
    });
    console.log('Opened connection with Arduino serial number ' + port.serialNumber);
  }
}

async function getArduino() {
  let ports = await SerialPort.list();
  for (port of ports) {
    if (port.vendorId == '2341' || port.vendorId == '3343')
      return port;
  }
  return null;
}



