import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  addDoc,
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import {
  FIREBASE_CONFIG,
  CLOUDINARY_CONFIG,
  DEFAULT_STATE,
  DEFAULT_MASCOT_PORTALS
} from "../config/defaults.js";

const STORAGE_KEY = "starleo_admin_luxury_state";
const CURRENT_PURGE_VERSION = 2;

export const clone = (v) => JSON.parse(JSON.stringify(v));

export const esc = (s) =>
  s === undefined || s === null
    ? ""
    : String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

export const icon = (name, size = 16) => `<i data-lucide="${name}" width="${size}"></i>`;

export function refreshIcons() {
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}

export function toast(title, message = "") {
  const wrap = document.getElementById("toastWrap");
  if (!wrap) return;
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = `<strong style="font-size:12px;color:#D4AF7A">${esc(title)}</strong>${
    message ? `<br><small style="color:#8b92a5">${esc(message)}</small>` : ""
  }`;
  wrap.appendChild(el);
  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transition = "opacity 0.2s ease";
    setTimeout(() => el.remove(), 220);
  }, 3200);
}

const isRemovedLocalOrLegacyVideo = (u) => {
  if (!u || typeof u !== "string") return true;
  return (
    u === "/LEON2.mp4" ||
    u === "/leonsito.webm" ||
    u.includes("yourimageshare.com") ||
    u.includes("w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf")
  );
};

function sanitizeLoadedState(raw) {
  const base = clone(DEFAULT_STATE);
  if (!raw || typeof raw !== "object") return base;

  const needsPurge = (raw.videoPurgeVersion || 0) < CURRENT_PURGE_VERSION;

  const cleanPortal = (id) => {
    const saved = raw.mascotPortals?.[id] || {};
    return {
      safari: needsPurge || isRemovedLocalOrLegacyVideo(saved.safari) ? "" : saved.safari,
      chrome: needsPurge || isRemovedLocalOrLegacyVideo(saved.chrome) ? "" : saved.chrome,
      s: Number.isFinite(Number(saved.s)) ? Number(saved.s) : 1,
      x: Number.isFinite(Number(saved.x)) ? Number(saved.x) : 0,
      y: Number.isFinite(Number(saved.y)) ? Number(saved.y) : 0
    };
  };

  const merged = {
    ...base,
    ...raw,
    videoPurgeVersion: CURRENT_PURGE_VERSION,
    mascotPortals: {
      1: cleanPortal(1),
      2: cleanPortal(2),
      3: cleanPortal(3)
    },
    pinnedWidgets: { ...base.pinnedWidgets, ...(raw.pinnedWidgets || {}) },
    requestStatuses: { ...(raw.requestStatuses || {}) },
    socials: { ...base.socials, ...(raw.socials || {}) }
  };

  if (Array.isArray(merged.requests)) {
    merged.requests = merged.requests.map((r) => {
      const clearVid = needsPurge || isRemovedLocalOrLegacyVideo(r.videoUrl);
      return {
        ...r,
        video: clearVid ? false : Boolean(r.videoUrl),
        videoUrl: clearVid ? "" : r.videoUrl
      };
    });
  } else {
    merged.requests = clone(base.requests);
  }

  if (Array.isArray(merged.tutorials)) {
    const cleaned = merged.tutorials
      .filter((t) => t && t.title)
      .map((t) => ({
        ...t,
        url: needsPurge || isRemovedLocalOrLegacyVideo(t.url) ? "" : t.url || "",
        type: needsPurge || isRemovedLocalOrLegacyVideo(t.url) ? "guide" : t.type || "video"
      }));
    merged.tutorials = cleaned.length ? cleaned : clone(base.tutorials);
  } else {
    merged.tutorials = clone(base.tutorials);
  }

  if (!Array.isArray(merged.supportContacts) || !merged.supportContacts.length) {
    merged.supportContacts = clone(base.supportContacts);
  }

  if (!Array.isArray(merged.tickets)) {
    merged.tickets = clone(base.tickets);
  }

  return merged;
}

function loadInitialState() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    const sanitized = sanitizeLoadedState(raw);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    return sanitized;
  } catch (_) {
    return clone(DEFAULT_STATE);
  }
}

export let state = loadInitialState();

const listeners = new Set();

export function onStateChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function notifyStateChange(source = "local") {
  listeners.forEach((fn) => {
    try {
      fn(state, source);
    } catch (e) {
      console.warn("Listener error:", e);
    }
  });
}

export function saveLocalState(source = "local") {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Almacenamiento local lleno:", e);
  }
  window.adminExecutiveState = state;
  notifyStateChange(source);
}

export function replaceFullState(nextState) {
  state = sanitizeLoadedState({ ...nextState, videoPurgeVersion: CURRENT_PURGE_VERSION });
  window.adminExecutiveState = state;
  saveLocalState("replace");
}

export function addActivity(action, detail = "") {
  const timeStr = new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
  const entry = [String(action || "Actividad"), String(detail || ""), timeStr];
  if (!Array.isArray(state.events)) state.events = [];
  state.events.unshift(entry);
  state.events = state.events.slice(0, 50);
  saveLocalState();
}

// ── FIREBASE INITIALIZATION ──
let db = null;
let stateDocRef = null;

try {
  const app = initializeApp(FIREBASE_CONFIG);
  db = getFirestore(app);
  stateDocRef = doc(db, "systemSettings", "globalStateDev4");
} catch (err) {
  console.warn("Firebase init warning:", err.message);
}

function setSyncStatus(online, label) {
  const badgeText = document.getElementById("syncBadgeText");
  const dot = document.querySelector("#syncBadge .status-dot");
  if (badgeText) badgeText.textContent = label;
  if (dot) dot.style.background = online ? "var(--green)" : "var(--yellow)";
}

export async function pushCloudState(patch = {}) {
  if (!stateDocRef) return false;
  try {
    await setDoc(stateDocRef, patch, { merge: true });
    setSyncStatus(true, "CLOUD SYNC");
    return true;
  } catch (err) {
    console.warn("Firestore sync local fallback:", err.message);
    setSyncStatus(false, "LOCAL SYNC");
    return false;
  }
}

export function syncCoreCollectionsToCloud() {
  return pushCloudState({
    tutorials: state.tutorials,
    supportContacts: state.supportContacts,
    socials: state.socials,
    notes: state.notes,
    requestStatuses: state.requestStatuses || {},
    updatedAt: new Date().toISOString()
  });
}

export function initCloudListeners({ onMascotUpdate } = {}) {
  if (!db || !stateDocRef) return;

  // Defer Firestore network listeners slightly so initial UI paint is instant
  setTimeout(() => {
    onSnapshot(
      stateDocRef,
      (snap) => {
        if (!snap.exists()) return;
        const data = snap.data() || {};
        let changed = false;

        [1, 2, 3].forEach((id) => {
          const current = state.mascotPortals[id] || { ...DEFAULT_MASCOT_PORTALS[id] };
          const nextS = data[`p${id}_s`] !== undefined ? Number(data[`p${id}_s`]) : current.s;
          const nextX = data[`p${id}_x`] !== undefined ? Number(data[`p${id}_x`]) : current.x;
          const nextY = data[`p${id}_y`] !== undefined ? Number(data[`p${id}_y`]) : current.y;

          const rawSafari = data[`p${id}_safari`];
          const rawChrome = data[`p${id}_chrome`];

          state.mascotPortals[id] = {
            safari: rawSafari && !isRemovedLocalOrLegacyVideo(rawSafari) ? rawSafari : "",
            chrome: rawChrome && !isRemovedLocalOrLegacyVideo(rawChrome) ? rawChrome : "",
            s: Number.isFinite(nextS) ? nextS : 1,
            x: Number.isFinite(nextX) ? nextX : 0,
            y: Number.isFinite(nextY) ? nextY : 0
          };
          changed = true;
        });

        if (Array.isArray(data.tutorials) && data.tutorials.length && data.tutorials[0]?.title) {
          state.tutorials = data.tutorials;
          changed = true;
        }

        if (Array.isArray(data.supportContacts) && data.supportContacts.length) {
          state.supportContacts = data.supportContacts;
          changed = true;
        }

        if (data.socials && typeof data.socials === "object") {
          state.socials = { ...state.socials, ...data.socials };
          changed = true;
        }

        if (data.requestStatuses && typeof data.requestStatuses === "object") {
          state.requestStatuses = { ...(state.requestStatuses || {}), ...data.requestStatuses };
          state.requests.forEach((r) => {
            if (state.requestStatuses[r.id]) r.status = state.requestStatuses[r.id];
          });
          changed = true;
        }

        if (typeof data.notes === "string" && data.notes.trim()) {
          state.notes = data.notes;
          changed = true;
        }

        if (changed) {
          saveLocalState("cloud");
          if (typeof onMascotUpdate === "function") onMascotUpdate();
        }
        setSyncStatus(true, "CLOUD SYNC");
      },
      () => setSyncStatus(false, "LOCAL MODE")
    );

    onSnapshot(
      collection(db, "registros_form"),
      (querySnap) => {
        let added = false;
        querySnap.forEach((docSnap) => {
          const d = docSnap.data() || {};
          const candidateId = d.candidateId || `SL-${docSnap.id.slice(0, 6).toUpperCase()}`;
          const existing = state.requests.find(
            (r) => r.id === candidateId || (d.email && d.createdAt && r.email === d.email && r.createdAt === d.createdAt)
          );

          const savedStatus = state.requestStatuses?.[candidateId];
          if (!existing) {
            const handle = d.tuId ? (String(d.tuId).startsWith("@") ? d.tuId : "@" + d.tuId) : "@streamer";
            state.requests.unshift({
              id: candidateId,
              name: d.nombre || "Postulante StarMaker",
              user: handle,
              country: d.nacionalidad || d.ciudad || "Global",
              city: d.ciudad || "",
              status: savedStatus || d.status || "EN REVISIÓN",
              video: false,
              videoUrl: "",
              photosUrl: d.fotosUrl || "",
              date: d.createdAt
                ? new Date(d.createdAt).toLocaleString("es-MX", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })
                : "Reciente",
              createdAt: d.createdAt || "",
              email: d.email || "",
              phone: d.telefono || "",
              agency: d.agencia || "",
              agentId: d.agentId || "",
              talent: d.talento || "",
              gender: d.genero || "",
              platform: d.plataforma || ""
            });
            added = true;
          } else if (savedStatus && existing.status !== savedStatus) {
            existing.status = savedStatus;
            added = true;
          }
        });

        if (added) saveLocalState("cloud-requests");
      },
      () => {}
    );

    onSnapshot(
      collection(db, "soporte_tickets"),
      (querySnap) => {
        let changed = false;
        querySnap.forEach((docSnap) => {
          const d = docSnap.data() || {};
          const ticketId = d.id || `TICK-${docSnap.id.slice(0, 4).toUpperCase()}`;
          if (!state.tickets.some((t) => t.id === ticketId)) {
            state.tickets.unshift({
              id: ticketId,
              name: d.name || "Creador",
              cat: d.cat || "Soporte General",
              msg: d.msg || "",
              status: d.status || "ABIERTO",
              date: d.date || new Date().toLocaleDateString("es-MX")
            });
            changed = true;
          }
        });
        if (changed) saveLocalState("cloud-tickets");
      },
      () => {}
    );
  }, 150);
}

// ── UNIVERSAL FILE UPLOADER ──
function fileToBase64Payload(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const full = String(reader.result || "");
      const comma = full.indexOf(",");
      resolve({ full, base64: comma >= 0 ? full.slice(comma + 1) : full });
    };
    reader.onerror = () => reject(new Error("No se pudo leer el archivo seleccionado."));
    reader.readAsDataURL(file);
  });
}

export async function uploadFileUniversal(file) {
  if (!file) throw new Error("Selecciona un archivo válido.");

  const isVideo = file.type.includes("video") || /\.(webm|mp4|mov)$/i.test(file.name || "");

  if (navigator.onLine && location.protocol.startsWith("http")) {
    try {
      const endpoint = isVideo
        ? `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/video/upload`
        : `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/auto/upload`;
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
      const res = await fetch(endpoint, { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        if (data?.secure_url) return data.secure_url;
      }
    } catch (_) {}

    if (file.size <= 12 * 1024 * 1024) {
      try {
        const { base64 } = await fileToBase64Payload(file);
        const ext = (file.name?.split(".").pop() || (isVideo ? "webm" : "jpg")).toLowerCase();
        const res = await fetch("/api/upload-file", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileBase64: base64, ext, mimeType: file.type })
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.url) return data.url;
        }
      } catch (_) {}
    }
  }

  if (file.size <= 2.5 * 1024 * 1024) {
    const { full } = await fileToBase64Payload(file);
    return full;
  }
  return URL.createObjectURL(file);
}

export async function submitRegistrationEverywhere(payload) {
  const candidateId = "SL-2026-" + Math.floor(10000 + Math.random() * 89999);
  const handle = payload.tuId
    ? String(payload.tuId).startsWith("@")
      ? payload.tuId
      : "@" + payload.tuId
    : "@streamer";

  const candidateRecord = {
    id: candidateId,
    name: payload.nombre || "Nuevo Postulante",
    user: handle,
    country: payload.nacionalidad || payload.ciudad || "Global",
    city: payload.ciudad || "",
    status: "EN REVISIÓN",
    video: Boolean(payload.videoUrl),
    videoUrl: payload.videoUrl || "",
    photosUrl: payload.fotosUrl || "",
    date: new Date().toLocaleString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }),
    createdAt: payload.createdAt,
    email: payload.email || "",
    phone: payload.telefono || "",
    agency: payload.agencia || "",
    agentId: payload.agentId || "",
    talent: payload.talento || "",
    gender: payload.genero || "",
    platform: payload.plataforma || ""
  };

  state.requests.unshift(candidateRecord);
  addActivity("Nueva postulación desde Portal 1", `${candidateRecord.name} · ${candidateId}`);

  const enrichedPayload = { ...payload, candidateId, status: "EN REVISIÓN" };
  await Promise.allSettled([
    fetch("/api/submit-excel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(enrichedPayload)
    }),
    db ? addDoc(collection(db, "registros_form"), enrichedPayload) : Promise.resolve()
  ]);

  return candidateRecord;
}

export async function submitTicketEverywhere({ name, cat, msg }) {
  const ticket = {
    id: "TICK-" + Math.floor(1000 + Math.random() * 8999),
    name: name.trim(),
    cat: cat || "Soporte General",
    msg: msg.trim(),
    status: "ABIERTO",
    date: new Date().toLocaleDateString("es-MX")
  };

  if (!Array.isArray(state.tickets)) state.tickets = [];
  state.tickets.unshift(ticket);
  addActivity("Nuevo ticket de soporte registrado", `${ticket.name} · ${ticket.id}`);

  if (db) {
    addDoc(collection(db, "soporte_tickets"), ticket).catch(() => {});
  }
  return ticket;
}
