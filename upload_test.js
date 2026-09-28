import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import dotenv from 'dotenv';
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

async function run() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);

  console.log("Autenticando en Firebase...");
  await signInWithEmailAndPassword(auth, "admin@starmaker.com", "Starmaker2026!");
  console.log("Autenticación exitosa.");

  const stateRef = doc(db, 'systemSettings', 'globalState');
  const snap = await getDoc(stateRef);
  let state = snap.exists() ? snap.data() : {};
  
  if (!state.cards) state.cards = [];
  if (state.cards.length === 0) {
     state.cards.push({ id: 'c1', title: 'León', subtitle: 'Holográfico', videoUrl: "https://i.yourimageshare.com/23ArbzDm1a.webm", badge: 'TEST' });
  } else {
     state.cards[0].videoUrl = "https://i.yourimageshare.com/23ArbzDm1a.webm";
  }
  
  const cleanState = JSON.parse(JSON.stringify(state));
  await setDoc(stateRef, cleanState, { merge: true });
  console.log("Firestore actualizado.");
  process.exit(0);
}

run().catch(console.error);
