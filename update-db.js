import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDaekBVpURtO-zWi3SgqLbzukzxffB6Jpk",
  authDomain: "starmaker-app-navi-2026.firebaseapp.com",
  projectId: "starmaker-app-navi-2026",
  storageBucket: "starmaker-app-navi-2026.firebasestorage.app",
  messagingSenderId: "975698061333",
  appId: "1:975698061333:web:8be68bfa1c4a94f343861c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const stateDocRef = doc(db, "systemSettings", "globalStateDev2");

async function updateLion() {
  try {
    const docSnap = await getDoc(stateDocRef);
    if (docSnap.exists()) {
      console.log(JSON.stringify(docSnap.data(), null, 2));
    } else {
      console.log("Document does not exist in DB.");
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

updateLion();
