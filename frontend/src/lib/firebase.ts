// Firebase configuration for co-interview
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCMCZqDX-HGvXCDRBlE0uXEeddlNC_oXwo",
  authDomain: "co-interview-481814.firebaseapp.com",
  projectId: "co-interview-481814",
  storageBucket: "co-interview-481814.firebasestorage.app",
  messagingSenderId: "391576745300",
  appId: "1:391576745300:web:4078bf13caea97a3c504c1",
  measurementId: "G-3ENXT54XQN"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Analytics (only in browser environment)
export const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);
