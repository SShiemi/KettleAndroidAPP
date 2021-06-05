require("firebase-functions");
const domain = require("./sensors");
const sensorsMock = require("./data");

domain.startListeners();

debugSerialPort();

async function debugSerialPort(){
    for (let i = 0; i < 11; i++) {
        await sleep(1000);
        sensorsMock.debug("water:450;temp:40");
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}