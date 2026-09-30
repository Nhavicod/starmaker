import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyC3iwfeStY1ANVcGIsH8rJD-8rJ5n_p_fE",
    authDomain: "starmaker-505b7.firebaseapp.com",
    projectId: "starmaker-505b7",
    storageBucket: "starmaker-505b7.firebasestorage.app",
    messagingSenderId: "52809712878",
    appId: "1:52809712878:web:49c92142f243a951a5dfff"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function testUpload() {
    try {
        const storageRef = ref(storage, 'test_ui_file.txt');
        await uploadString(storageRef, 'Hello Firebase Storage!');
        const url = await getDownloadURL(storageRef);
        console.log("Success! URL:", url);
    } catch(err) {
        console.error("Firebase Storage Error:", err.message);
    }
}
testUpload();
