// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 🔴 PASTE YOUR CONFIG HERE FROM FIREBASE CONSOLE
const firebaseConfig = {
  apiKey: "AIzaSyCgtZATBvZzrePbxFqdu3Z88gFRkoUsXj8",
  authDomain: "macro-chef-eb1c8.firebaseapp.com",
  projectId: "macro-chef-eb1c8",
  storageBucket: "macro-chef-eb1c8.firebasestorage.app",
  messagingSenderId: "894212204626",
  appId: "1:894212204626:web:8ab83029d47f5eed94d78b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);