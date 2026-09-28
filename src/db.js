/**
 * STARMAKER Database Service (Firebase v10 Modular SDK)
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

const SETTINGS_COLLECTION = "systemSettings";
const GLOBAL_STATE_DOC = "globalStateDev4";
export const stateDocRef = doc(db, SETTINGS_COLLECTION, GLOBAL_STATE_DOC);

export const DEFAULT_STATE = {
  theme: {
    primary: "#E64381",
    accent: "#F18D79",
    background: "#050507"
  },
  cards: [
    {
      id: "card-streamer",
      title: "León",
      subtitle: "Mascota Holográfica",
      videoUrl: "/leonsito.webm",
      posterUrl: "",
      link: "#/registro",
      badge: "LIVE HUB",
      active: true,
      order: 1
    }
  ],
  panelMascots: {
    streamer: {
      gif: "",
      x: 0,
      y: 0,
      scale: 100
    }
  },
  carouselSettings: {
    autoplay: true,
    interval: 5000
  },
  tutorials: [],
  activity: []
};

export function normalizeState(raw) {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_STATE };

  return {
    theme: {
      primary: typeof raw.theme?.primary === "string" ? raw.theme.primary : DEFAULT_STATE.theme.primary,
      accent: typeof raw.theme?.accent === "string" ? raw.theme.accent : DEFAULT_STATE.theme.accent,
      background: typeof raw.theme?.background === "string" ? raw.theme.background : DEFAULT_STATE.theme.background
    },
    cards: (Array.isArray(raw.cards) ? raw.cards : [...DEFAULT_STATE.cards]).map((rawC, index) => {
      const c = { ...rawC };
      if (index === 0 || c.id === "card-streamer") {
        c.videoUrl = "/leonsito.webm";
      }
      return c;
    }),
    panelMascots: {
      streamer: {
        gif: raw.panelMascots?.streamer?.gif || "",
        x: typeof raw.panelMascots?.streamer?.x === "number" ? raw.panelMascots.streamer.x : 0,
        y: typeof raw.panelMascots?.streamer?.y === "number" ? raw.panelMascots.streamer.y : 0,
        scale: typeof raw.panelMascots?.streamer?.scale === "number" ? raw.panelMascots.streamer.scale : 100
      }
    },
    carouselSettings: {
      autoplay: typeof raw.carouselSettings?.autoplay === "boolean" ? raw.carouselSettings.autoplay : true,
      interval: typeof raw.carouselSettings?.interval === "number" ? raw.carouselSettings.interval : 5000
    },
    tutorials: Array.isArray(raw.tutorials) ? raw.tutorials : [],
    activity: Array.isArray(raw.activity) ? raw.activity : []
  };
}

export function subscribeToState(onData, onError) {
  return onSnapshot(
    stateDocRef,
    (docSnap) => {
      if (docSnap.exists()) {
        onData(normalizeState(docSnap.data()));
      } else {
        onData({ ...DEFAULT_STATE });
      }
    },
    (error) => {
      console.error("[STARMAKER DB] Error Firestore:", error);
      if (typeof onError === "function") onError(error);
    }
  );
}

export async function saveState(state) {
  if (!state || typeof state !== "object") throw new Error("Estado inválido.");
  // Regla 10: Eliminación obligatoria de valores undefined
  const cleanState = JSON.parse(JSON.stringify(state));
  await setDoc(stateDocRef, cleanState, { merge: true });
}
