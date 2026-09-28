import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC3iwfeStY1ANVcGIsH8rJD-8rJ5n_p_fE",
  authDomain: "starmaker-505b7.firebaseapp.com",
  projectId: "starmaker-505b7",
  storageBucket: "starmaker-505b7.firebasestorage.app",
  messagingSenderId: "52809712878",
  appId: "1:52809712878:web:49c92142f243a951a5dfff",
  measurementId: "G-MYD1M5XRTY"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  try {
    const docRef = doc(db, "systemSettings", "globalState");
    const snap = await getDoc(docRef);
    if(snap.exists()) {
       console.log("SUCCESS! Document exists. Data: ", JSON.stringify(snap.data()).substring(0,50));
    } else {
       console.log("SUCCESS! Database read allowed, but document is empty (which is normal for a new database).");
    }
  } catch(e) {
    console.error("ERROR: ", e.message);
  }
  process.exit();
}

test();
