import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { db } from "../db.js";

export const auth = getAuth(db.app);

export async function loginAdmin(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("[STARMAKER Auth] Fallo al iniciar sesión:", error);
    throw error;
  }
}

export async function logoutAdmin() {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("[STARMAKER Auth] Fallo al cerrar sesión:", error);
    throw error;
  }
}

export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser() {
  return auth.currentUser;
}
