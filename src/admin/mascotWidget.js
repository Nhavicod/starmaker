import { PORTALES, DEFAULT_MASCOT_PORTALS } from "../config/defaults.js";
import {
  state,
  saveLocalState,
  pushCloudState,
  uploadFileUniversal,
  toast,
  addActivity
} from "../services/bridge.js";
import { seleccionarPunto, syncMascotStageFromState } from "../showroom/stage.js";

function showMascotWidgetError(err) {
  console.error(err);
  const box = document.getElementById("admin-error-msg");
  if (!box) return;
  box.style.display = "block";
  box.textContent = "Aviso: " + (err?.message || String(err));
  setTimeout(() => {
    box.style.display = "none";
  }, 6000);
}

export function renderMascotControls() {
  const container = document.getElementById("admin-portals-config");
  if (!container) return;

  container.innerHTML = PORTALES.map((p) => {
    const cfg = state.mascotPortals?.[p.id] || DEFAULT_MASCOT_PORTALS[p.id];
    const s = Number(cfg.s ?? 1);
    const x = Number(cfg.x ?? 0);
    const y = Number(cfg.y ?? 0);

    return `
      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:18px;margin-bottom:16px;">
        <h4 style="color:${p.adminColor};font-size:12.5px;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">Portal ${p.id} — ${p.name}</h4>

        <label style="font-size:11px;color:#b9b0ba;display:block;margin-bottom:5px;">Video Safari / iOS (.mp4)</label>
        <label style="display:block;padding:11px 14px;background:rgba(255,255,255,0.06);border:1px dashed rgba(255,255,255,0.2);border-radius:10px;cursor:pointer;font-size:12.5px;font-weight:700;text-align:center;margin-bottom:10px;" id="lbl-safari-${p.id}">
          📂 Subir MP4 (Safari)
          <input type="file" style="display:none;" accept="video/mp4,video/quicktime" onchange="uploadVideo(this,'p${p.id}_safari','mp4','lbl-safari-${p.id}')" />
        </label>

        <label style="font-size:11px;color:#b9b0ba;display:block;margin-bottom:5px;">Video Chrome / Android (.webm)</label>
        <label style="display:block;padding:11px 14px;background:rgba(255,255,255,0.06);border:1px dashed rgba(255,255,255,0.2);border-radius:10px;cursor:pointer;font-size:12.5px;font-weight:700;text-align:center;margin-bottom:12px;" id="lbl-chrome-${p.id}">
          📂 Subir WebM (Chrome)
          <input type="file" style="display:none;" accept="video/webm" onchange="uploadVideo(this,'p${p.id}_chrome','webm','lbl-chrome-${p.id}')" />
        </label>

        <button type="button" onclick="deleteVideo(${p.id})" style="width:100%;padding:9px;margin-bottom:14px;background:rgba(255,100,100,0.1);color:#ff7b7b;border:1px solid rgba(255,100,100,0.22);border-radius:8px;cursor:pointer;font-size:11.5px;font-weight:800;">
          🔄 Restaurar Mascota Base del Portal
        </button>

        <p style="font-size:11px;color:#b9b0ba;margin-bottom:8px;">Ajuste espacial en tiempo real</p>
        <div class="slider-row">
          <span>Escala</span>
          <input id="sl-s-${p.id}" type="range" min="0.3" max="3" step="0.05" value="${s}" oninput="liveTransform(${p.id})" />
          <span id="val-s-${p.id}">${s.toFixed(2)}</span>
        </div>
        <div class="slider-row">
          <span>Pos X</span>
          <input id="sl-x-${p.id}" type="range" min="-200" max="200" step="5" value="${x}" oninput="liveTransform(${p.id})" />
          <span id="val-x-${p.id}">${x}px</span>
        </div>
        <div class="slider-row">
          <span>Pos Y</span>
          <input id="sl-y-${p.id}" type="range" min="-200" max="200" step="5" value="${y}" oninput="liveTransform(${p.id})" />
          <span id="val-y-${p.id}">${y}px</span>
        </div>
        <button type="button" onclick="saveTransform(${p.id})" style="width:100%;padding:10px;margin-top:6px;background:rgba(241,141,121,0.18);color:#fff;border:1px solid rgba(241,141,121,0.35);border-radius:9px;cursor:pointer;font-size:12px;font-weight:800;">
          💾 Guardar Calibración
        </button>
      </div>
    `;
  }).join("");
}

export function syncMascotSlidersFromState() {
  [1, 2, 3].forEach((id) => {
    const cfg = state.mascotPortals?.[id] || DEFAULT_MASCOT_PORTALS[id];
    const slS = document.getElementById(`sl-s-${id}`);
    if (!slS) return;
    slS.value = cfg.s ?? 1;
    document.getElementById(`val-s-${id}`).innerText = Number(cfg.s ?? 1).toFixed(2);
    document.getElementById(`sl-x-${id}`).value = cfg.x ?? 0;
    document.getElementById(`val-x-${id}`).innerText = `${cfg.x ?? 0}px`;
    document.getElementById(`sl-y-${id}`).value = cfg.y ?? 0;
    document.getElementById(`val-y-${id}`).innerText = `${cfg.y ?? 0}px`;
  });
}

export function toggleMascotWidget() {
  const w = document.getElementById("mascot-widget");
  if (!w) return;
  if (w.classList.contains("is-open")) {
    closeMascotWidget();
  } else {
    syncMascotSlidersFromState();
    w.style.display = "flex";
    w.classList.add("is-open");
  }
}

export function closeMascotWidget() {
  const w = document.getElementById("mascot-widget");
  if (!w) return;
  w.classList.remove("is-open");
  w.style.display = "none";
}

export function liveTransform(id) {
  const portalObj = PORTALES.find((p) => p.id === Number(id)) || PORTALES[0];
  if (window.currentPortal !== Number(id)) {
    seleccionarPunto(
      portalObj.id,
      portalObj.targetId,
      portalObj.ctaText,
      portalObj.accent,
      portalObj.glow,
      portalObj.rgb
    );
  }

  const s = parseFloat(document.getElementById(`sl-s-${id}`).value);
  const x = parseInt(document.getElementById(`sl-x-${id}`).value, 10);
  const y = parseInt(document.getElementById(`sl-y-${id}`).value, 10);

  document.getElementById(`val-s-${id}`).innerText = s.toFixed(2);
  document.getElementById(`val-x-${id}`).innerText = `${x}px`;
  document.getElementById(`val-y-${id}`).innerText = `${y}px`;

  const root = document.documentElement;
  root.style.setProperty(`--vp${id}-s`, s);
  root.style.setProperty(`--vp${id}-x`, `${x}px`);
  root.style.setProperty(`--vp${id}-y`, `${y}px`);

  if (!state.mascotPortals[id]) state.mascotPortals[id] = { ...DEFAULT_MASCOT_PORTALS[id] };
  state.mascotPortals[id].s = s;
  state.mascotPortals[id].x = x;
  state.mascotPortals[id].y = y;
}

export async function saveTransform(id) {
  liveTransform(id);
  const cfg = state.mascotPortals[id];
  saveLocalState();
  addActivity(`Mascota Portal ${id} calibrada`, `Escala ${cfg.s.toFixed(2)} · X:${cfg.x} · Y:${cfg.y}`);

  const synced = await pushCloudState({
    [`p${id}_s`]: cfg.s,
    [`p${id}_x`]: cfg.x,
    [`p${id}_y`]: cfg.y
  });

  toast(
    `Portal ${id} guardado`,
    synced ? "Calibración sincronizada en la nube y local." : "Calibración guardada localmente."
  );
}

export async function uploadVideo(input, fieldName, ext, lblId) {
  const file = input.files?.[0];
  if (!file) return;

  if (file.size > 200 * 1024 * 1024) {
    toast("Archivo excede límite", "El tamaño máximo permitido es 200 MB.");
    return;
  }

  const portalId = Number(fieldName.charAt(1));
  const portalObj = PORTALES.find((p) => p.id === portalId) || PORTALES[0];
  const previewBlobUrl = URL.createObjectURL(file);

  // Instant live preview on the 3D stage
  window.processors?.[portalId]?.setSource(previewBlobUrl, { localBlob: true });
  const vidEl = document.getElementById(`vid-p${portalId}`);
  if (vidEl) vidEl.dataset.uploading = "true";

  seleccionarPunto(
    portalObj.id,
    portalObj.targetId,
    portalObj.ctaText,
    portalObj.accent,
    portalObj.glow,
    portalObj.rgb
  );

  const lbl = document.getElementById(lblId);
  if (lbl) {
    lbl.style.color = "var(--coral)";
    lbl.firstChild.textContent = "⏳ Subiendo activo... ";
  }

  try {
    const uploadedUrl = await uploadFileUniversal(file);
    const kind = fieldName.endsWith("safari") ? "safari" : "chrome";
    if (!state.mascotPortals[portalId]) {
      state.mascotPortals[portalId] = { ...DEFAULT_MASCOT_PORTALS[portalId] };
    }
    state.mascotPortals[portalId][kind] = uploadedUrl;

    if (vidEl) delete vidEl.dataset.uploading;
    saveLocalState();
    await pushCloudState({ [fieldName]: uploadedUrl });

    if (lbl) {
      lbl.style.color = "#4ade80";
      lbl.firstChild.textContent = `✅ ${file.name} `;
    }
    addActivity(`Video Mascota Portal ${portalId} actualizado`, file.name);
    toast("Mascota actualizada", `Activo cargado en Portal ${portalId}.`);
  } catch (err) {
    if (vidEl) delete vidEl.dataset.uploading;
    showMascotWidgetError(err);
    if (lbl) {
      lbl.style.color = "#ff7b7b";
      lbl.firstChild.textContent = `❌ Reintentar subida (${ext.toUpperCase()}) `;
    }
  }
}

export async function deleteVideo(id) {
  if (!confirm("¿Restaurar el video de mascota por defecto para este portal?")) return;
  state.mascotPortals[id] = {
    ...DEFAULT_MASCOT_PORTALS[id],
    s: state.mascotPortals[id]?.s ?? 1,
    x: state.mascotPortals[id]?.x ?? 0,
    y: state.mascotPortals[id]?.y ?? 0
  };
  saveLocalState();
  syncMascotStageFromState();
  renderMascotControls();
  await pushCloudState({
    [`p${id}_safari`]: null,
    [`p${id}_chrome`]: null
  });
  toast(`Portal ${id} restaurado`, "Se restableció la mascota oficial StarLeo.");
}

export function initMascotWidget() {
  renderMascotControls();

  const mascotWidget = document.getElementById("mascot-widget");
  const mascotHeader = document.getElementById("mascot-widget-header");
  if (!mascotHeader || !mascotWidget) return;

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startTop = 0;

  const beginDrag = (clientX, clientY, target) => {
    if (target?.id === "btn-close-mascot") return;
    isDragging = true;
    startX = clientX;
    startY = clientY;
    const rect = mascotWidget.getBoundingClientRect();
    startLeft = rect.left;
    startTop = rect.top;
    document.body.style.userSelect = "none";
  };

  const moveDrag = (clientX, clientY) => {
    if (!isDragging) return;
    const nextLeft = Math.max(8, Math.min(window.innerWidth - 120, startLeft + (clientX - startX)));
    const nextTop = Math.max(8, Math.min(window.innerHeight - 80, startTop + (clientY - startY)));
    mascotWidget.style.left = `${nextLeft}px`;
    mascotWidget.style.top = `${nextTop}px`;
    mascotWidget.style.right = "auto";
  };

  const endDrag = () => {
    isDragging = false;
    document.body.style.userSelect = "";
  };

  mascotHeader.addEventListener("mousedown", (e) => beginDrag(e.clientX, e.clientY, e.target));
  window.addEventListener("mousemove", (e) => moveDrag(e.clientX, e.clientY));
  window.addEventListener("mouseup", endDrag);

  mascotHeader.addEventListener(
    "touchstart",
    (e) => beginDrag(e.touches[0].clientX, e.touches[0].clientY, e.target),
    { passive: true }
  );
  window.addEventListener(
    "touchmove",
    (e) => moveDrag(e.touches[0].clientX, e.touches[0].clientY),
    { passive: true }
  );
  window.addEventListener("touchend", endDrag);
}
