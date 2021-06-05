const server = require('./server');// data module

let currentWater = 0,
    currentTemperature = 0,
    totalWaterReserved = 0;

let lastWeightMeasurements = [];
let waterIsCounted = false;

let brewingStatus = 'Not Brewing';

function startListeners() {
    server.listenRef("/kettle/status", toggleStatus);
    server.listenRef("kettle/brewing", toggleBrewing);
    server.listenRef("/reservations/", countWaterReserved);
    server.listenRefChild("/reservations/", processNewReservations);
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
    brewingStatus = brewingRef.val();

    if (brewingStatus.toLowerCase() === "Starting") {
        server.sendToFirebase("/kettle/brewing", "Brewing").then(function () {
            console.log("Brewing changed to:" + brewingStatus);
        });
    } else if (brewingStatus.toLowerCase() === "Stop Brewing") {
        server.sendToFirebase("/kettle/brewing", "Not Brewing").then(function () {
            console.log("Brewing changed to:" + brewingStatus);
        });
        server.getUserReservationByStatus("Done", processDoneReservation);
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

function processNewReservations(reservationRef) {

    if (waterIsCounted) {
        let reservation = reservationRef.val();

        let UUID = reservationRef.getRef().getKey();

        if (reservation.status.toLowerCase() === "pending") {
            if (reservation.amount < currentWater - totalWaterReserved) {
                server.sendToFirebase("/reservations/" + UUID + "/status", "Approved")
                    .then(
                        function () {
                            console.log("/reservations/" + UUID + "changed to Approved");
                        }
                    );
                server.sendToFirebase("/user-reservations/" + reservation.userUid + "/" + UUID + "/status", "Approved")
                    .then(
                        function () {
                            console.log("/user-reservations/" + reservation.userUid + "/" + UUID + "changed to Approved");
                        }
                    );
            } else {
                server.sendToFirebase("/reservations/" + UUID + "/status", "Rejected")
                    .then(
                        function () {
                            console.log("/reservations/" + UUID + "changed to Rejected");
                        }
                    );
                server.sendToFirebase("/user-reservations/" + reservation.userUid + "/" + UUID + "/status", "Rejected")
                    .then(
                        function () {
                            console.log("/user-reservations/" + reservation.userUid + "/" + UUID + "changed to Rejected");
                        }
                    );
            }
        }
    }
}

function processApprovedReservations(reservationsRef) {

    let reservations = reservationsRef.val();

    if (reservations !== null) {
        for (const [UUID, entry] of Object.entries(reservations)) {
            if (entry.status.toLowerCase() === "approved") {
                server.sendToFirebase("/reservations/" + UUID + "/status", "Brewing")
                    .then(
                        function () {
                            console.log("/reservations/" + UUID + "changed to Brewing");
                        }
                    );
                server.sendToFirebase("/user-reservations/" + entry.userUid + "/" + UUID + "/status", "Brewing")
                    .then(
                        function () {
                            console.log("/user-reservations/" + entry.userUid + "/" + UUID + "changed to Brewing");
                        }
                    );
            }
        }
    }
}

function processBrewingReservations(reservationsRef) {

    let reservations = reservationsRef.val();

    if (reservations !== null) {
        for (const [UUID, entry] of Object.entries(reservations)) {
            if (entry.status.toLowerCase() === "brewing") {
                server.sendToFirebase("/reservations/" + UUID + "/status", "Done")
                    .then(
                        function () {
                            console.log("/reservations/" + UUID + "changed to Done");
                        }
                    );
                server.sendToFirebase("/user-reservations/" + entry.userUid + "/" + UUID + "/status", "Done")
                    .then(
                        function () {
                            console.log("/user-reservations/" + entry.userUid + "/" + UUID + "changed to Done");
                        }
                    );
            }
        }
    }
}

function processDoneReservation(reservationsRef) {

    let reservations = reservationsRef.val();

    if (reservations !== null) {
        for (const [UUID, entry] of Object.entries(reservations)) {
            if (entry.status.toLowerCase() === "done") {
                server.sendToFirebase("/reservations/" + UUID + "/status", "Deleted")
                    .then(
                        function () {
                            console.log("/reservations/" + UUID + "changed to Done");
                        }
                    );
                server.sendToFirebase("/user-reservations/" + entry.userUid + "/" + UUID + "/status", "Deleted")
                    .then(
                        function () {
                            console.log("/user-reservations/" + entry.userUid + "/" + UUID + "changed to Done");
                        }
                    );
            }
        }
    }
}

function handleArduinoData(data) {
    currentTemperature = parseFloat(data["temp"]);
    addWaterMeasurement(data["water"]);
    checkBrewing();
}

function addWaterMeasurement(measurement) {
    lastWeightMeasurements.push(measurement / 10);

    if (lastWeightMeasurements.length >= 10) {
        lastWeightMeasurements = lastWeightMeasurements.slice(-10);

        updateWaterLevel(
            lastWeightMeasurements.reduce(
                (a, b) => a + b
            )
        );
    }
}

function updateWaterLevel(newWaterLevel) {
    if (currentWater * 0.95 > newWaterLevel || newWaterLevel > currentWater * 1.05) {
        currentWater = newWaterLevel;
        server.sendToFirebase('kettle/cur_water', currentWater)
            .then(
                function () {
                    if (parseInt(currentWater) === 0) {
                        console.log("Kettle set to empty");
                    } else {
                        console.log("Water Level changed to " + currentWater + " ml");
                    }
                }
            );
        if (!waterIsCounted) {
            waterIsCounted = true;
            server.sendToFirebase("/kettle/status", "Idle").then(function () {
                console.log("Status changed to:" + status);
            });
        }
    }
}

function checkBrewing() {
    if (currentTemperature > 99 && brewingStatus === "Brewing") {
        server.sendToFirebase('kettle/brewing', "Stop Brewing")
            .then(
                function () {
                    console.log("Kettle Stops brewing");
                }
            );
        server.getUserReservationByStatus("Brewing", processBrewingReservations);
    } else if (currentTemperature > 30 && brewingStatus === "Not Brewing") {
        server.sendToFirebase('kettle/brewing', "Start Brewing")
            .then(
                function () {
                    console.log("Kettle Starts brewing");
                }
            );
        server.getUserReservationByStatus("Approved", processApprovedReservations);
    }
}

let output = {
    startListeners: startListeners,
    handleArduinoData: handleArduinoData,
};

module.exports = output;