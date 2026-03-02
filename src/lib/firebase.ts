import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyB71zGHrLVlpwCckIpKQcH2wiXEhQc4hFs",
    authDomain: "restaobot.firebaseapp.com",
    projectId: "restaobot",
    storageBucket: "restaobot.firebasestorage.app",
    messagingSenderId: "43818046473",
    appId: "1:43818046473:web:a0cd078de7e8693cb014d8",
    measurementId: "G-H3QPM4RL14",
};

// Initialize Firebase (prevent duplicate initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
