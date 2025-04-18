// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"; 
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
 

// Your web app's Firebase configuration 
const firebaseConfig = {
  apiKey: "AIzaSyDgh0_u3OiVlYVFgsO6MHqG28G8CZzcYEs",
  authDomain: "book-tracker-2bc87.firebaseapp.com",
  projectId: "book-tracker-2bc87",
  storageBucket: "book-tracker-2bc87.firebasestorage.app",
  messagingSenderId: "171798256332",
  appId: "1:171798256332:web:f6e062b482c1c538fb0069",
  measurementId: "G-QQ610LT72K"
};
 
// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app); // Firestore initialization

export { auth, provider,  signInWithPopup, signOut, db  };