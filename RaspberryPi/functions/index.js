require("firebase-functions");
const domain = require("./sensors");
const sensorsMock = require("./data");

domain.startListeners();

debugSerialPort().then(function (){
    console.log("Arduino Mock is done loading data!");
});

async function debugSerialPort(){
    for (let i = 0; i < 11; i++) {
        await sleep(1000);
        sensorsMock.debug("water:900;temp:20");
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}