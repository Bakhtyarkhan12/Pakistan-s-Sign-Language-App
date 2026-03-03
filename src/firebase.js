// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // ✅ Firestore for profile storage

const firebaseConfig = {
  apiKey: "AIzaSyB-IWkRTmQnErYfUPkCgC_VnMuZCfSFvlY",
  authDomain: "signspeakly.firebaseapp.com",
  projectId: "signspeakly",
  storageBucket: "signspeakly.appspot.com",
  messagingSenderId: "336361063348",
  appId: "1:336361063348:web:42d6b887611e712425a8e1"
};

// ✅ Initialize Firebase App
const app = initializeApp(firebaseConfig);

// ✅ Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
