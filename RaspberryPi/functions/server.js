const firebase = require('firebase/app');
require('firebase/database');
require('firebase/auth');

let firebaseConfig = {
    apiKey: "AIzaSyD9YDpsSi8vNWaojjdUTM9TeNWUcUdHh6Q",
    authDomain: "chaleira-fcup.firebaseapp.com",
    databaseURL: "https://chaleira-fcup-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "chaleira-fcup",
    storageBucket: "chaleira-fcup.appspot.com",
    messagingSenderId: "736611827239",
    appId: "1:736611827239:web:de4021618fedf5f8141802"
};

let app = firebase.initializeApp(firebaseConfig); // Initialize Firebase
firebase.auth().signInWithEmailAndPassword('kettle@example.com', 'password').then(
    function () {
        console.log("Logged in as admin!");
    }
);
let database = app.database();

function sendToFirebase(path, value) {
    return database.ref(path).set(value).then(() => {
        return value;
    }).catch((error) => {
        console.log('Synchronization failed at ' + path);
        console.log('Error on send data ' + error);
        throw error;
    });
}

function deleteFromFirebase(path) {
    return database.ref(path).set({}).then(
        function (){
            console.log(path + " deleted ")
        }
    ).catch((error) => {
        console.log('Synchronization failed at ' + path);
        console.log('Error on send data ' + error);
        throw error;
    });
}

function listenRef(path, callback) {
    database.ref(path).on('value', (snapshot) => {
        callback(snapshot);
    });
}

function listenRefChild(path, callback) {
    database.ref(path).on('child_added', (snapshot) => {
        callback(snapshot);
    });
}

function getUserReservationByStatus(status, callback) {
    firebase
        .database()
        .ref('/reservations/')
        .orderByChild('status')
        .equalTo(status)
        .once("value", callback)
        .then(
            function () {
                console.log("Reservations with status " + status + " obtained");
            }
        );
}

let output = {
    listenRef: listenRef,
    sendToFirebase: sendToFirebase,
    listenRefChild: listenRefChild,
    deleteFromFirebase: deleteFromFirebase,
    getUserReservationByStatus: getUserReservationByStatus,
};

module.exports = output;