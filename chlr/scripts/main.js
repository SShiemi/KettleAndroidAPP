'use strict';
// Shortcuts to DOM Elements.
var statusContainer = document.getElementById('status');
var currWaterContainer = document.getElementById('cur_water');
var maxWaterContainer = document.getElementById('max_water');
var countReservationsContainer = document.getElementById('reservations_count');
var reservationTableBody = document.getElementById('reservation_table_body');
var reservationUserTableBody = document.getElementById('reservation_user_table_body');
var debugUUID = 'f0YWpdQP04Yi2vG8mB49LCBBFlm2';
var listeningFirebaseRefs = [];
var listeningFirebaseUserRefs = [];
var maxWater;
var currentUID;
var debug;
function cleanReservationTable() {
  reservationTableBody.innerHTML = '';
}
function addReservationEntry(data) {
  if (data.val() !== null) {
    let entries = Object.values(data.val());
    cleanReservationTable();
    countReservationsContainer.innerHTML = entries.length;
    entries.forEach(function (entry) {
      reservationTableBody.innerHTML = reservationTableBody.innerHTML + '<tr><td>' + entry.userUid + '</td><td>' + entry.amount + '</td><td>' + entry.status
          + '</td></tr>';
    });
  }
}
/**
 * Writes the user's data to the database.
 */
function writeUserData(userId, name, email, imageUrl) {
  firebase.database().ref('users/' + userId).set({
    username: name,
    email: email,
    profile_picture: imageUrl
  });
}
function reserve() {
  let amount = prompt('Amount?');
  if (amount > 0) {
    reserveWater(currentUID, amount, 'pending');
  }
}
function switchKettleStatus() {
  let status = prompt('New Status?');
  if (status !== '') {
    setKettleStatus(status);
  }
}
function setWaterLevel() {
  let amount = prompt('Amount?');
  if (amount > 0) {
    changeWaterLevel(amount);
  }
}
function cleanUserReservationTable() {
  reservationUserTableBody.innerHTML = '';
}
function addUserReservationEntry(data) {
  if (data.val() !== null) {
    let entries = Object.values(data.val());
    cleanUserReservationTable();
    entries.forEach(function (entry) {
      reservationUserTableBody.innerHTML = '' + reservationUserTableBody.innerHTML + '<tr><td>' + entry.userUid + '</td><td>' + entry.amount + '</td><td>'
          + entry.status
          + '</td></tr>';
    });
  }
}
function getUserReservations() {
  let userUUID = prompt('user?', debugUUID);
  if (userUUID !== '') {
    getUserReservationByUUID(userUUID);
    // getUserReservationByStatusAndUUID(userUUID, 'done');
  }
}
function changeReservationStatus() {
  let reservationUUID = prompt('reservation?');
  if (reservationUUID !== '') {
    let newStatus = prompt('status?', 'pending');
    if (newStatus !== '') {
      updateReservationStatusById(reservationUUID, newStatus);
    }
  }
}
/* Firebase Listeners */
function updateValueByRef(dbRef, element) {
  dbRef.on('value', function (data) {
    element.innerHTML = data.val();
  });
}
function refreshData(dbRef, entryCallback) {
  dbRef.on('value', entryCallback);
  // dbRef.on('child_added', entryCallback);
  // dbRef.on('child_removed', entryCallback);
  // dbRef.on('child_changed', entryCallback);
}
/**
 * Starts listening for new posts and populates posts lists.
 */
function startDatabaseQueries() {
  var myUserId = firebase.auth().currentUser.uid;
  var statusRef = firebase.database().ref('/kettle/status');
  var curWaterRef = firebase.database().ref('/kettle/cur_water');
  var reservationCountRef = firebase.database().ref('/reservations/');
  // Fetching and displaying all posts of each sections.
  updateValueByRef(statusRef, statusContainer);
  updateValueByRef(curWaterRef, currWaterContainer);
  refreshData(reservationCountRef, addReservationEntry);
  // Keep track of all Firebase refs we are listening to.
  listeningFirebaseRefs.push(statusRef);
  listeningFirebaseRefs.push(curWaterRef);
  listeningFirebaseRefs.push(reservationCountRef);
}
/**
 * Cleanups the UI and removes all Firebase listeners.
 */
function cleanupDB() {
  // Stop all currently listening Firebase listeners.
  listeningFirebaseRefs.forEach(function (ref) {
    ref.off();
  });
  listeningFirebaseRefs = [];
}
/**
 * Triggers every time there is a change in the Firebase auth state (i.e. user signed-in or user signed out).
 */
function onAuthStateChanged(user) {
  // We ignore token refresh events.
  if (user && currentUID === user.uid) {
    return;
  }
  cleanupDB();
  if (user) {
    currentUID = user.uid;
    maxWaterContainer.innerHTML = maxWater;
    writeUserData(user.uid, user.displayName, user.email, user.photoURL);
    startDatabaseQueries();
  } else {
    // Set currentUID to null.
    currentUID = null;
  }
}
// Bindings on load.
window.addEventListener('load', function () {
  // login
  firebase.auth().signInWithEmailAndPassword('kettle@example.com', 'password');
  //set max water value
  maxWater = 1000;
  // Listen for auth state changes
  firebase.auth().onAuthStateChanged(onAuthStateChanged);
}, false);
function cleanupFilteredDB() {
  // Stop all currently listening Firebase listeners.
  listeningFirebaseUserRefs.forEach(function (ref) {
    ref.off();
  });
  listeningFirebaseUserRefs = [];
}
/* Firebase Communication interactions */
function reserveWater(userUid, amount, status) {
  var reservationData = {
    userUid: userUid,
    amount: amount,
    status: status
  };
  var newReservationKey = firebase.database().ref().child('reservations').push().key;
  var updates = {};
  updates['/reservations/' + newReservationKey] = reservationData;
  updates['/user-reservations/' + userUid + '/' + newReservationKey] = reservationData;
  return firebase.database().ref().update(updates);
}
function clearReservations() {
  var up = {};
  up['/reservations/'] = [];
  up['/user-reservations/'] = [];
  firebase.database().ref().update(up);
  cleanReservationTable();
}
function setKettleStatus(status) {
  var updates = {};
  updates['/kettle/status'] = status;
  return firebase.database().ref().update(updates);
}
function changeWaterLevel(amount) {
  var updates = {};
  updates['/kettle/cur_water'] = amount;
  return firebase.database().ref().update(updates);
}
function getUserReservationByUUID(userUUID) {
  cleanupFilteredDB();
  var reservationCountRef = firebase.database().ref('/user-reservations/' + userUUID);
  refreshData(reservationCountRef.orderByChild('status'), addUserReservationEntry);
  listeningFirebaseUserRefs.push(reservationCountRef);
}
function getUserReservationByStatusAndUUID(userUUID, status) {
  cleanupFilteredDB();
  var reservationCountRef = firebase.database().ref('/user-reservations/' + userUUID);
  refreshData(reservationCountRef.orderByChild('status').equalTo(status), addUserReservationEntry);
  listeningFirebaseUserRefs.push(reservationCountRef);
}
function updateReservationStatusById(reservationUUID, status) {
  let up = {};
  up['/reservations/' + reservationUUID + '/status'] = status;
  up['/user-reservations/' + currentUID + '/' + reservationUUID + '/status'] = status;
  return firebase.database().ref().update(up);
}