import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDrcf6wJZ4x8o6hhidcl129S0nc6Aj7Nl8",
    authDomain: "voluntrac.firebaseapp.com",
    databaseURL: "https://voluntrac-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "voluntrac",
    storageBucket: "voluntrac.appspot.com",
    messagingSenderId: "90015380714",
    appId: "1:90015380714:web:5bdc1a5b48913effca1393"
  };

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

export { db, auth }