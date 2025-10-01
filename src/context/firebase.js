import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDzMbbh3tB7Je3wKEu9oMBxoq2miPCQzn4",
  authDomain: "filltrip-f5e4d.firebaseapp.com",
  projectId: "filltrip-f5e4d",
  storageBucket: "filltrip-f5e4d.firebasestorage.app",
  messagingSenderId: "805948229739",
  appId: "1:805948229739:web:cdb6e6c285ddd0448c092e",
  measurementId: "G-4YQSTL5X1T"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;