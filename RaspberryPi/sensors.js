const ON = 0, // on
      OFF = 1; //off


var data = require('../data.js'), // data module -> de onde vem os dados dos sensores
    status = OFF,
    brewing = false,
    currentWater = 0
    maxWater = 450 //Maximum amount that the kettle can handle
    totalWaterReserved =0;

//temperature

//humidity

//weight

function measureWaterLevel() {

}

function measureWaterTemperature(){ 
}

function measureWaterHumidity(){ 

}

/*
function checkKettle(){

}*/

function checkBrewing(reservation){

	if(humidity>70 && temperature>99){
		sendtoFirebase('kettle/brewing',"Stop Brewing");
		data.sendtoFirebase('kettle/cur_water',weight);
		processBrewingReservation(reservation); //transita de ferver para done
	}
	else if (humidity>50 && temperature>30 && temperature<99 ){
		sendtoFirebase('kettle/brewing',"Brewing");
		data.sendtoFirebase('kettle/cur_water',weight);
		processApprovedReservation(reservation); //transita de aprovada para a ferver
	}
	else {
		sendtoFirebase('kettle/brewing',"Not Brewing"); //transita de done para deleted ?
		data.sendtoFirebase('kettle/cur_water',weight);
		processDoneReservation(reservation); 
	}

}

function toggleStatus(status){
	if ( status == "Starting") {
		sendToFirebase("/kettle/status", "Idle");

	}
	else if (status == "Shutting Down") {
		sendToFirebase("/kettle/status", "Off");
	}
}

listenRef("/kettle/status", toggleStatus);

function toggleBrewing(brewing){
	if ( brewing == "Starting") {
		sendToFirebase("/kettle/brewing", "Brewing");
		setReservationsBrewing();
	}
	else if ( brewing == "Stop Brewing") {
		sendToFirebase("/kettle/brewing", "Not Brewing");
		setReservationsDone();
	}
}

listenRef("kettle/brewing",toggleBrewing);

function countWaterReserved(reservations){
	var WaterReserved=0;
if (data.val() !== null) {
    let entries = Object.values(data.val());
        entries.forEach(function (entry) {
        	if (entry.status == "Approved") {
    	WaterReserved+=entry.amount;
    	}
    });
  }
  totalWaterReserved=WaterReserved;
}

listenRef("/reservations/",countWaterReserved);

listenRefChild("/reservations/",processNewReservation);

function processNewReservation(reservation){

	var totalAmount=0;

	let UUID = reservation.getRef().getKey();

	if( reservation.status == "Pending") {

		if( reservation.amount < currentWater - totalWaterReserved ) {
			sendToFirebase("/reservations/" + UUID + "/status", "Approved");
			sendToFirebase("/user-reservations/" + reservation.userUid + "/"+ UUID  + "/status", "Approved");
		}
		else {
			sendToFirebase("/reservations/" + UUID + "status", "Rejected");
			sendToFirebase("/user-reservations/" + reservation.userUid  + "/"+ UUID + "/status", "Rejected");
		}
	
	}
}

function processApprovedReservation(reservation){

	let UUID = reservation.getRef().getKey();

	if( reservation.status == "Approved") {
			sendToFirebase("/reservations/" + UUID + "/status", "Brewing");
			sendToFirebase("/user-reservations/" + reservation.userUid + "/"+ UUID  + "/status", "Brewing");
	}

}

function processBrewingReservation(reservation){

	let UUID = reservation.getRef().getKey();

	if( reservation.status == "Brewing") {
			sendToFirebase("/reservations/" + UUID + "/status", "Done");
			sendToFirebase("/user-reservations/" + reservation.userUid + "/"+ UUID  + "/status", "Done");
	}

}

function processDoneReservation(reservation){

	let UUID = reservation.getRef().getKey();

	if( reservation.status == "Done") {
			sendToFirebase("/reservations/" + UUID + "/status", "Deleted");
			sendToFirebase("/user-reservations/" + reservation.userUid + "/"+ UUID  + "/status", "Deleted");
	}

}

listenRef("/user-reservations/",getUserReservationByStatus); //???????????

function getUserReservationByStatusAndUUID(userUUID, status) {
  cleanupFilteredDB();
  var reservationCountRef = firebase.database().ref('/user-reservations/' + userUUID);
  refreshData(reservationCountRef.orderByChild('status').equalTo(status), addUserReservationEntry);
  listeningFirebaseUserRefs.push(reservationCountRef);
}

function setReservationsBrewing(){
	return getUserReservationByStatus("Approved");
}

function setReservationsDone(){
	return getUserReservationByStatus("Done");
//TO DO
}
