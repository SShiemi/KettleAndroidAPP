//Serial communication with Arduino - Read the sensors connected arduino
//install node js on rpi
//install npm
//install serial library : https://www.npmjs.com/package/serialport


var serialport=require("serialport");

console.log("hi");

//ls /dev/tty* to find port
var port = new serialport('/dev/ttyACMO',{ 

	baudRate:9600,
	//parser:serialport.parsers.readline('\n')
});

const Readline=serialport.parsers.Readline;
const parser=new Readline();
port.pipe(parser);

port.on('open',onPortOpen);
parser.on('data', onData);
port.one('close',onClose);
port.on('error',onError);
port.write('Hi mom!');

function onPortOpen(){
	console.log("port Open");
}

function onData(data){
	console.log("data received: "+data);
}

function onClose(){
	console.log("port closed");
}

function onError(){
	console.log("Something went wrong in serial communication");
}

//correr com node data.js
