import * as firebase from "firebase"
require("@firebase/firestore")
var firebaseConfig = {
  apiKey: "AIzaSyCDhiDDzabCem_i7qPppPwRi6VdyrZuick",
  authDomain: "wily-778ff.firebaseapp.com",
  databaseURL: "https://wily-778ff-default-rtdb.firebaseio.com",
  projectId: "wily-778ff",
  storageBucket: "wily-778ff.appspot.com",
  messagingSenderId: "314763989660",
  appId: "1:314763989660:web:c012d9bcb4c1a4fc46d359"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
export default firebase.firestore();