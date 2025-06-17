import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBAS20Z4udaYvIF4ES-3qwQ1sYL7tcw41Y",
  authDomain: "spotify-clone-6c492.firebaseapp.com",
  projectId: "spotify-clone-6c492",
  storageBucket: "spotify-clone-6c492.firebasestorage.app",
  messagingSenderId: "28855964952",
  appId: "1:28855964952:web:d365dec9df752ceb293a6d",
  measurementId: "G-6RB1ZQ99L4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };

