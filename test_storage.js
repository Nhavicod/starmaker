import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadString } from "firebase/storage";

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
const storage = getStorage(app);

async function test() {
  try {
    const storageRef = ref(storage, "test_file.txt");
    await uploadString(storageRef, "Hello World");
    console.log("SUCCESS! Storage upload allowed.");
  } catch(e) {
    console.error("ERROR: ", e.message);
  }
  process.exit();
}

test();
