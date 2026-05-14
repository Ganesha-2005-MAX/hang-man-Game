import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCcKerZJNuiPDm0WX89nxUfzrD9qK3KMtg",
  authDomain: "hang-man-4d4c2.firebaseapp.com",
  projectId: "hang-man-4d4c2",
  storageBucket: "hang-man-4d4c2.firebasestorage.app",
  messagingSenderId: "782722006217",
  appId: "1:782722006217:web:88b7828359ae300eb02118",
  measurementId: "G-SNVC9K6MP9",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
setPersistence(auth, browserSessionPersistence);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
