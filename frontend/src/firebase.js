import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyByYr9Tl6J9-B6OcbXadQZjOVlFt6ZFAxY",
  authDomain: "sdlproj-96a12.firebaseapp.com",
  projectId: "sdlproj-96a12",
  storageBucket: "sdlproj-96a12.firebasestorage.app",
  messagingSenderId: "755626962462",
  appId: "1:755626962462:web:ba2c5424887089b06c880f",
  measurementId: "G-MR7WJPKTHP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
