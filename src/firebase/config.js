// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCNX9ICSG9bdJhb6nMPnyuNhbewE_smf_4",
  authDomain: "ape-prop.firebaseapp.com",
  projectId: "ape-prop",
  storageBucket: "ape-prop.firebasestorage.app",
  messagingSenderId: "914963337229",
  appId: "1:914963337229:web:cbfb2b1fd203c842070544",
  measurementId: "G-CP394V00F8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };