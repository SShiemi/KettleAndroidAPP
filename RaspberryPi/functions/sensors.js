// var data = require('./data');// data module
const server = require('./server');// data module

let currentWater = 0,
    currentTemperature = 0,
    currentHumidity = 0,
    maxWater = 450, //Maximum amount that the kettle can handle
    totalWaterReserved = 0;

let lastWeightMeasurements = [];
let waterIsCounted = false;

function startListeners() {
    server.listenRef("/kettle/status", toggleStatus);
    server.listenRef("kettle/brewing", toggleBrewing);
    server.listenRef("/reservations/", countWaterReserved);
    server.listenRefChild("/reservations/", processNewReservation);
}

function toggleStatus(statusRef) {
    let status = statusRef.val()

    if (status.toLowerCase() === "starting") {
        if (waterIsCounted) {
            server.sendToFirebase("/kettle/status", "Idle").then(function () {
                console.log("Status changed to:" + status);
            });
        }
        //TODO add code to turn the kettle ON if proper hardware exists!
    } else if (status.toLowerCase() === "shutting down") {
        server.sendToFirebase("/kettle/status", "Off").then(function () {
            console.log("Status changed to:" + status);
        });
        //TODO add code to turn the kettle OFF if proper hardware exists!
    }
}

function toggleBrewing(brewingRef) {
    let brewing = brewingRef.val();

    if (brewing.toLowerCase() === "starting") {
        server.sendToFirebase("/kettle/brewing", "Brewing").then(function () {
            console.log("Brewing changed to:" + brewing);
        });
        setReservationsBrewing();
    } else if (brewing.toLowerCase() === "stop brewing") {
        server.sendToFirebase("/kettle/brewing", "Not Brewing").then(function () {
            console.log("Brewing changed to:" + brewing);
        });
        setReservationsDone();
    }
}

function countWaterReserved(reservationsRef) {
    let WaterReserved = 0;
    let reservations = reservationsRef.val();

    if (reservations !== null) {
        let entries = Object.values(reservations);
        entries.forEach(function (entry) {
            if (entry.status.toLowerCase() === "approved") {
                WaterReserved += parseInt(entry.amount);
            }
        });
    }
    totalWaterReserved = WaterReserved;
    waterIsCounted = true;
}

function processNewReservation(reservationRef) {

    if (waterIsCounted) {
        let reservation = reservationRef.val();

        let UUID = reservationRef.getRef().getKey();

        if (reservation.status.toLowerCase() === "pending") {
            if (reservation.amount < currentWater - totalWaterReserved) {
                server.sendToFirebase("/reservations/" + UUID + "/status", "Approved");
                server.sendToFirebase("/user-reservations/" + reservation.userUid + "/" + UUID + "/status", "Approved");
            } else {
                server.sendToFirebase("/reservations/" + UUID + "/status", "Rejected");
                server.sendToFirebase("/user-reservations/" + reservation.userUid + "/" + UUID + "/status", "Rejected");
            }

        }
    }
}

function processApprovedReservation(reservation) {

    console.log(reservation.val());

    let UUID = reservation.getRef().getKey();

    if (reservation.status === "Approved") {
        server.sendToFirebase("/reservations/" + UUID + "/status", "Brewing");
        server.sendToFirebase("/user-reservations/" + reservation.userUid + "/" + UUID + "/status", "Brewing");
    }

}

function processBrewingReservation(reservation) {

    let UUID = reservation.getRef().getKey();

    if (reservation.status === "Brewing") {
        server.sendToFirebase("/reservations/" + UUID + "/status", "Done");
        server.sendToFirebase("/user-reservations/" + reservation.userUid + "/" + UUID + "/status", "Done");
    }

}

function processDoneReservation(reservation) {

    let UUID = reservation.getRef().getKey();

    if (reservation.status === "Done") {
        server.sendToFirebase("/reservations/" + UUID + "/status", "Deleted");
        server.sendToFirebase("/user-reservations/" + reservation.userUid + "/" + UUID + "/status", "Deleted");
    }

}

function setReservationsBrewing() {
    return server.getUserReservationByStatus("Approved");
}

function setReservationsDone() {
    return server.getUserReservationByStatus("Done");
}

function handleArduinoData(data) {
    currentHumidity = data["humidity"];
    currentTemperature = data["temp"];
    addWaterMeasurement(data["water"]);
    checkBrewing();
}

function addWaterMeasurement(measurement) {
    lastWeightMeasurements.push(measurement / 10);

    if (lastWeightMeasurements.length >= 10) {
        lastWeightMeasurements.slice(1);

        updateWaterLevel(
            lastWeightMeasurements.reduce(
                (a, b) => a + b
            )
        );
    }
}

function updateWaterLevel(newWaterLevel) {
    if (currentWater * 0.95 < newWaterLevel || newWaterLevel < currentWater * 1.05) {
        currentWater = newWaterLevel;
        server.sendToFirebase('kettle/cur_water', currentWater);
        if (!waterIsCounted) {
            waterIsCounted = true;
            server.sendToFirebase("/kettle/status", "Idle").then(function () {
                console.log("Status changed to:" + status);
            });
        }
    }
}

function checkBrewing() {
    if (currentTemperature > 99) {
        server.sendToFirebase('kettle/brewing', "Stop Brewing");
        server.getUserReservationByStatus("Brewing", processBrewingReservation);
    } else if (currentHumidity > 50 && currentTemperature > 30 && currentTemperature < 99) {
        server.sendToFirebase('kettle/brewing', "Brewing");
        server.getUserReservationByStatus("Approved", processApprovedReservation);
    } else {
        server.sendToFirebase('kettle/brewing', "Not Brewing");
        server.getUserReservationByStatus("Done", processDoneReservation);
    }
}

let output = {
    startListeners: startListeners,
    handleArduinoData: handleArduinoData,
};

module.exports = output;