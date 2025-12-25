
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Substitua estas configurações pelas do seu projeto no Console do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAbMk-GC7N8V3eYcU2L0c437FsbTZ9vs_4",
  authDomain: "orcamentos-f222a.firebaseapp.com",
  projectId: "orcamentos-f222a",
  storageBucket: "orcamentos-f222a.firebasestorage.app",
  messagingSenderId: "16246252006",
  appId: "1:16246252006:web:249c45907f03b276e9f627"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
