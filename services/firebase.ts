// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDoubcy1C4MS13RNpYJRUnac_vLiYuOgiM",
  authDomain: "pickme-f7a2a.firebaseapp.com",
  projectId: "pickme-f7a2a",
  storageBucket: "pickme-f7a2a.firebasestorage.app",
  messagingSenderId: "306647027146",
  appId: "1:306647027146:web:b8f3761326cef817545333",
  measurementId: "G-ZBW1M18PMW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export default app;
