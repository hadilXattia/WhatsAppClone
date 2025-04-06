// Import the functions you need from the SDKs you need
import app from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCecGG4xSvlbLtPh9-hUdiF8C3q_X1BGPk",
  authDomain: "whatsapp-9d412.firebaseapp.com",
  databaseURL: "https://whatsapp-9d412-default-rtdb.firebaseio.com",
  projectId: "whatsapp-9d412",
  storageBucket: "whatsapp-9d412.firebasestorage.app",
  messagingSenderId: "77583188691",
  appId: "1:77583188691:web:5068d87b656f8f1e67ca26",
  measurementId: "G-10DNT6YF59",
};

// Initialize Firebase
const firebase = app.initializeApp(firebaseConfig);
export default firebase;
