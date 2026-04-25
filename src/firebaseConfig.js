// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCbx0rjVXO62lfvlbPgGwHV28lLk5DdTzo",
  authDomain: "silent-voice-a133f.firebaseapp.com",
  projectId: "silent-voice-a133f",
  storageBucket: "silent-voice-a133f.firebasestorage.app",
  messagingSenderId: "1055370112449",
  appId: "1:1055370112449:web:5afef0608a3a66aa885340",
  measurementId: "G-DQHXZ3XVJ0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);