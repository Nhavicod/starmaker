import { DEFAULT_STATE } from "../config/defaults.js";
import {
  state,
  clone,
  esc,
  icon,
  refreshIcons,
  toast,
  saveLocalState,
  replaceFullState,
  addActivity,
  uploadFileUniversal,
  syncCoreCollectionsToCloud,
  pushCloudState
} from "../services/bridge.js";
import {
  syncTutorialsToPortal,
  syncSupportToPortal,
  syncSocialsToPortal
} from "../portals/portals.js";
import { syncMascotStageFromState } from "../showroom/stage.js";
import { renderMascotControls } from "./mascotWidget.js";

let adminTab = "overview";
let requestFilter = "ALL";
let requestSearch = "";
let requestViewMode = "grid"; // 'grid' (status cards) or 'list'
let ticketFilter = "ALL";

export function openModal(id) {
  document.getElementById(id)?.classList.add("open");
  refreshIcons();
}

export function closeModal(id) {
  document.getElementById(id)?.classList.remove("open");
}

export function openDrawer() {
  document.getElementById("drawer")?.classList.add("open");
}

export function closeDrawer() {
  document.getElementById("drawer")?.classList.remove("open");
}

// ── PINNED / SUNKEN (AWAKE / SLEEP) WIDGET SYSTEM ──
function widget(id, kicker, title, body, kpiValue, iconName = "sparkles") {
  const isPinned = state.pinnedWidgets?.[id] !== false;
  const cls = isPinned ? "pinned" : "sunken";

  return `
    <article class="widget ${cls}" id="${id}">
      <div class="glow"></div>
      <div class="full-view widget-pad">
        <div class="widget-head">
          <div>
            <span class="kicker">${kicker}</span>
            <h3>${title}</h3>
          </div>
          <button type="button" class="switch" onclick="togglePin('${id}', event)" title="Prender / Dormir tarjeta">
            ${icon("lightbulb", 14)}
          </button>
        </div>
        ${body}
      </div>
      <div class="minimal-view" onclick="wakeWidget('${id}')" title="Clic para despertar tarjeta">
        <strong class="kpi">${kpiValue}</strong>
        <div style="display:flex;flex-direction:column;align-items:flex-start;margin-right:auto;">
          <span style="font-size:11.5px;font-weight:700;color:#fff;">${title}</span>
          <span style="font-size:9.5px;color:var(--muted);">En reposo · Toca para abrir</span>
        </div>
        ${icon(iconName, 20)}
      </div>
    </article>`;
}

export function togglePin(id, event) {
  event?.stopPropagation();
  const el = document.getElementById(id);
  if (!el) return;
  if (!state.pinnedWidgets) state.pinnedWidgets = {};

  if (el.classList.contains("pinned")) {
    el.classList.remove("pinned");
    el.classList.add("sunken");
    state.pinnedWidgets[id] = false;
  } else {
    el.classList.add("pinned");
    el.classList.remove("sunken");
    state.pinnedWidgets[id] = true;
  }
  saveLocalState();
}

export function wakeWidget(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove("sunken");
  el.classList.add("pinned");
  if (!state.pinnedWidgets) state.pinnedWidgets = {};
  state.pinnedWidgets[id] = true;
  saveLocalState();
}

// ── REQUEST CARDS & ROWS ──
function requestRow(r) {
  const color = r.status === "APROBADA" ? "green" : r.status === "RECHAZADA" ? "red" : "yellow";
  return `
    <div class="request">
      <div class="avatar">${esc((r.name || "U")[0])}</div>
      <div>
        <strong>${esc(r.name)}</strong>
        <div class="meta">${esc(r.user)} · ${esc(r.country)} · ${esc(r.date)} · <span style="color:var(--primary)">${esc(r.id)}</span></div>
        <div style="display:flex;gap:6px;margin-top:6px;align-items:center;flex-wrap:wrap">
          <span class="chip ${color}">${esc(r.status)}</span>
          ${r.video ? `<span class="badge">${icon("video", 11)} Video</span>` : ""}
          ${r.agency ? `<span class="chip">${esc(r.agency)}</span>` : ""}
        </div>
      </div>
      <div class="request-actions">
        ${r.video ? `<button type="button" class="btn btn-secondary mini" onclick="openVideoReview('${esc(r.id)}')" title="Ver video">${icon("play", 13)}</button>` : ""}
        <button type="button" class="btn btn-secondary mini" onclick="openRequest('${esc(r.id)}')" title="Inspeccionar expediente">${icon("eye", 14)} Expediente</button>
        <button type="button" class="btn btn-danger mini" onclick="deleteRequest('${esc(r.id)}')" title="Eliminar">${icon("trash-2", 13)}</button>
      </div>
    </div>`;
}

function requestCardGrid(r) {
  const color = r.status === "APROBADA" ? "green" : r.status === "RECHAZADA" ? "red" : "yellow";
  const borderCol =
    r.status === "APROBADA"
      ? "rgba(69, 208, 158, 0.38)"
      : r.status === "RECHAZADA"
      ? "rgba(224, 108, 117, 0.38)"
      : "rgba(232, 185, 96, 0.38)";
  const topBar =
    r.status === "APROBADA" ? "var(--green)" : r.status === "RECHAZADA" ? "var(--danger)" : "var(--yellow)";

  return `
    <div class="request-card-item" style="border:1px solid ${borderCol};">
      <div style="position:absolute;top:0;left:0;right:0;height:4px;background:${topBar};"></div>
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <span class="badge" style="font-family:monospace;">${esc(r.id)}</span>
          <span class="chip ${color}">${esc(r.status)}</span>
        </div>

        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
          <div class="avatar" style="width:44px;height:44px;font-size:17px;">${esc((r.name || "U")[0])}</div>
          <div>
            <strong style="font-size:14.5px;color:#fff;display:block;">${esc(r.name)}</strong>
            <span style="font-size:12px;color:var(--primary);font-weight:600;">${esc(r.user)}</span>
          </div>
        </div>

        <div style="display:grid;gap:5px;font-size:11.5px;color:var(--muted);background:rgba(255,255,255,0.02);padding:10px;border-radius:10px;border:1px solid var(--line);">
          <div>País: <b style="color:#fff;">${esc(r.country)}</b>${r.city ? ` · ${esc(r.city)}` : ""}</div>
          ${r.talent ? `<div>Talento: <b style="color:#fff;">${esc(r.talent)}</b></div>` : ""}
          ${r.agency ? `<div>Agencia: <b style="color:#fff;">${esc(r.agency)}</b></div>` : ""}
          <div>Casting: <b style="color:${r.video ? "var(--green)" : "var(--muted)"}">${r.video ? "Video 10s Adjunto" : "Sin Video"}</b></div>
        </div>
      </div>

      <div style="border-top:1px solid var(--line);padding-top:12px;">
        <div style="display:flex;gap:6px;margin-bottom:8px;">
          <button type="button" class="btn btn-secondary mini" style="flex:1;" onclick="openRequest('${esc(r.id)}')">${icon("eye", 13)} Expediente</button>
          ${r.video ? `<button type="button" class="btn btn-secondary mini" onclick="openVideoReview('${esc(r.id)}')">${icon("play", 13)} Video</button>` : ""}
          <button type="button" class="btn btn-danger mini" onclick="deleteRequest('${esc(r.id)}')">${icon("trash-2", 13)}</button>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px;">
          <button type="button" class="chip green" style="justify-content:center;padding:5px 4px;font-size:9.5px;" onclick="setRequest('${esc(r.id)}','APROBADA')">Aprobar</button>
          <button type="button" class="chip yellow" style="justify-content:center;padding:5px 4px;font-size:9.5px;" onclick="setRequest('${esc(r.id)}','EN REVISIÓN')">Revisión</button>
          <button type="button" class="chip red" style="justify-content:center;padding:5px 4px;font-size:9.5px;" onclick="setRequest('${esc(r.id)}','RECHAZADA')">Declinar</button>
        </div>
      </div>
    </div>`;
}

export function openRequest(id) {
  const r = state.requests.find((x) => x.id === id);
  if (!r) return;

  const photos = (r.photosUrl || "")
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);

  const photosHtml = photos.length
    ? `<div style="margin-top:12px;">
        <span class="kicker" style="display:block;margin-bottom:8px;">Identificación Oficial Adjunta (${photos.length})</span>
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(140px, 1fr));gap:10px;">
          ${photos
            .map(
              (url, idx) => `
            <a href="${esc(url)}" target="_blank" rel="noopener" style="display:block;border-radius:12px;overflow:hidden;border:1px solid var(--line);background:#08090e;height:110px;">
              <img src="${esc(url)}" alt="ID ${idx + 1}" style="width:100%;height:100%;object-fit:cover;" />
            </a>`
            )
            .join("")}
        </div>
      </div>`
    : "";

  const cleanWa = String(r.phone || "").replace(/[^0-9]/g, "");
  const waBtn = cleanWa.length >= 7
    ? `<a href="https://api.whatsapp.com/send?phone=${cleanWa}&text=${encodeURIComponent(
        `Hola ${r.name}, te contactamos del equipo oficial de STARMAKER sobre tu expediente ${r.id}.`
      )}" target="_blank" rel="noopener" class="btn btn-secondary mini" style="color:#45D09E;border-color:rgba(69,208,158,0.35);">WhatsApp Directo ↗</a>`
    : "";

  const drawerPanel = document.getElementById("drawerPanel");
  drawerPanel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
      <div>
        <span class="kicker">Dossier de Candidato</span>
        <h2 style="margin:4px 0;font-size:22px">${esc(r.name)}</h2>
      </div>
      <button type="button" class="btn btn-secondary btn-icon" onclick="closeDrawer()">${icon("x", 16)}</button>
    </div>

    <div style="display:flex;gap:8px;margin:14px 0;flex-wrap:wrap;align-items:center;">
      <span class="chip ${r.status === "APROBADA" ? "green" : r.status === "RECHAZADA" ? "red" : "yellow"}">${esc(r.status)}</span>
      <span class="badge">${esc(r.id)}</span>
      ${waBtn}
    </div>

    <div class="metric-row"><span>Usuario StarMaker</span><strong>${esc(r.user)}</strong></div>
    <div class="metric-row"><span>Región / Ciudad</span><strong>${esc(r.country)}${r.city ? ` · ${esc(r.city)}` : ""}</strong></div>
    ${r.email ? `<div class="metric-row"><span>Correo Electrónico</span><strong>${esc(r.email)}</strong></div>` : ""}
    ${r.phone ? `<div class="metric-row"><span>Teléfono / WhatsApp</span><strong>${esc(r.phone)}</strong></div>` : ""}
    ${r.agency ? `<div class="metric-row"><span>Agencia / Reclutador</span><strong>${esc(r.agency)}${r.agentId ? ` (${esc(r.agentId)})` : ""}</strong></div>` : ""}
    ${r.talent ? `<div class="metric-row"><span>Talento Principal</span><strong>${esc(r.talent)}</strong></div>` : ""}
    ${r.platform ? `<div class="metric-row"><span>Plataformas Previas</span><strong>${esc(r.platform)}</strong></div>` : ""}
    <div class="metric-row"><span>Fecha de Registro</span><strong>${esc(r.date)}</strong></div>

    ${photosHtml}

    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-top:20px">
      <button type="button" class="btn btn-primary" onclick="setRequest('${esc(r.id)}','APROBADA')">${icon("check", 14)} Aprobar</button>
      <button type="button" class="btn btn-secondary" onclick="setRequest('${esc(r.id)}','EN REVISIÓN')">${icon("clock", 14)} En Revisión</button>
      <button type="button" class="btn btn-danger" onclick="setRequest('${esc(r.id)}','RECHAZADA')">${icon("x", 14)} Declinar</button>
    </div>
    ${
      r.video
        ? `<button type="button" class="btn btn-secondary" style="width:100%;margin-top:10px" onclick="openVideoReview('${esc(r.id)}')">${icon("play-circle", 15)} Reproducir Video de Verificación</button>`
        : ""
    }
  `;

  openDrawer();
  refreshIcons();
}

export function setRequest(id, status) {
  const r = state.requests.find((x) => x.id === id);
  if (!r) return;
  r.status = status;
  if (!state.requestStatuses) state.requestStatuses = {};
  state.requestStatuses[id] = status;

  addActivity(`Solicitud ${status.toLowerCase()}`, `${r.name} · ${r.id}`);
  pushCloudState({ requestStatuses: state.requestStatuses });
  toast("Dictamen registrado", `${r.name} → ${status}`);
  closeDrawer();
  renderAdmin();
}

export function deleteRequest(id) {
  const idx = state.requests.findIndex((x) => x.id === id);
  if (idx === -1) return;
  const name = state.requests[idx].name;
  state.requests.splice(idx, 1);
  addActivity("Expediente eliminado", `${name} · ${id}`);
  toast("Expediente eliminado", name);
  renderAdmin();
}

export function openVideoReview(id) {
  const r = state.requests.find((x) => x.id === id);
  if (!r) return;
  document.getElementById("mediaModalKicker").textContent = "Media Inspection · " + r.id;
  document.getElementById("mediaModalTitle").textContent = "Casting de " + r.name;
  document.getElementById("reviewVideoArea").innerHTML = r.videoUrl
    ? `<div class="notice" style="margin-bottom:14px">Reproduciendo activo de verificación de <b>${esc(r.name)}</b> (${esc(r.user)}).</div>
       <video src="${esc(r.videoUrl)}" controls autoplay loop playsinline style="width:100%;max-height:380px;border-radius:16px;background:#05060a;border:1px solid var(--line)"></video>
       <div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px;flex-wrap:wrap;gap:10px">
         <a href="${esc(r.videoUrl)}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:6px;color:var(--primary);font-size:12px;font-weight:600">${icon("external-link", 13)} Abrir fuente directa</a>
         <div style="display:flex;gap:8px">
           <button type="button" class="btn btn-primary mini" onclick="setRequest('${esc(r.id)}','APROBADA');closeModal('videoReviewModal')">${icon("check", 13)} Aprobar Talento</button>
           <button type="button" class="btn btn-danger mini" onclick="setRequest('${esc(r.id)}','RECHAZADA');closeModal('videoReviewModal')">${icon("x", 13)} Rechazar</button>
         </div>
       </div>`
    : `<div class="empty">No hay archivo de video vinculado a este expediente.</div>`;
  closeDrawer();
  openModal("videoReviewModal");
}

export function openNewRequestModal() {
  document.getElementById("nrName").value = "";
  document.getElementById("nrUser").value = "";
  document.getElementById("nrVideoUrl").value = "";
  openModal("newRequestModal");
}

export async function handleNewRequestVideoUpload(file) {
  if (!file) return;
  toast("Procesando video", "Subiendo activo...");
  try {
    const url = await uploadFileUniversal(file);
    document.getElementById("nrVideoUrl").value = url;
    toast("Video listo", file.name);
  } catch (e) {
    toast("Error", e.message);
  }
}

export function createNewRequest() {
  const name = document.getElementById("nrName").value.trim();
  const user = document.getElementById("nrUser").value.trim();
  const country = document.getElementById("nrCountry").value;
  const status = document.getElementById("nrStatus").value;
  const videoUrl = document.getElementById("nrVideoUrl").value.trim();
  if (!name || !user) return toast("Campos requeridos", "Ingresa nombre y usuario.");

  const id = "SL-2026-" + Math.floor(10000 + Math.random() * 89999);
  state.requests.unshift({
    id,
    name,
    user: user.startsWith("@") ? user : "@" + user,
    country,
    status,
    video: Boolean(videoUrl),
    videoUrl,
    date: new Date().toLocaleString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  });
  addActivity("Nueva solicitud manual", `${name} · ${id}`);
  closeModal("newRequestModal");
  renderAdmin();
  toast("Expediente creado", `${name} (${id})`);
}

// ── TAB 1: OVERVIEW ──
function renderOverview() {
  const total = state.requests.length;
  const pending = state.requests.filter((r) => !["APROBADA", "RECHAZADA"].includes(r.status)).length;
  const approved = state.requests.filter((r) => r.status === "APROBADA").length;
  const withVideo = state.requests.filter((r) => r.video).length;
  const tutCount = state.tutorials?.length || 0;
  const openTickets = (state.tickets || []).filter((t) => t.status !== "RESUELTO").length;

  return `<div class="admin-grid">
    ${widget(
      "w-kpi",
      "EXPEDIENTES TOTALES",
      "Postulaciones recibidas",
      `<div class="kpi">${total}</div><div style="color:var(--muted);font-size:11px;margin-top:10px">${withVideo} con video · ${tutCount} recursos en Academia</div>`,
      total,
      "users"
    )}
    ${widget(
      "w-pending",
      "POR DICTAMINAR",
      "En espera de revisión",
      `<div class="kpi">${pending}</div><div class="progress-bar" style="margin-top:16px"><span style="width:${Math.min(100, pending * 25)}%"></span></div>`,
      pending,
      "clock"
    )}
    ${widget(
      "w-approved",
      "TALENTOS APROBADOS",
      "Streamers oficiales",
      `<div class="kpi">${approved}</div><div style="color:var(--muted);font-size:11px;margin-top:10px">Creadores certificados</div>`,
      approved,
      "award"
    )}
    ${widget(
      "w-tickets",
      "CONCIERGE DESK",
      "Tickets abiertos",
      `<div class="kpi">${openTickets}</div><div style="color:var(--muted);font-size:11px;margin-top:10px">${state.tickets?.length || 0} consultas registradas</div>`,
      openTickets,
      "headphones"
    )}

    <article class="widget span-2 pinned" id="w-notes">
      <div class="glow"></div>
      <div class="full-view widget-pad">
        <div class="widget-head">
          <div><span class="kicker">Directrices y Turnos</span><h3>Bitácora Estratégica</h3></div>
        </div>
        <div class="field" style="margin:6px 0;">
          <textarea class="control" style="height:148px;resize:none;line-height:1.6" placeholder="Escribe aquí las directrices y notas del equipo..." onchange="updateNotes(this.value)">${esc(state.notes || "")}</textarea>
        </div>
      </div>
    </article>

    <article class="widget span-2 pinned" id="w-inbox-preview">
      <div class="glow"></div>
      <div class="full-view widget-pad">
        <div class="widget-head">
          <div><span class="kicker">Talent Acquisition</span><h3>Bandeja Prioritaria</h3></div>
          <button type="button" class="btn btn-secondary mini" onclick="setAdminTab('requests')">Ver Todas →</button>
        </div>
        <div class="request-list">
          ${state.requests.slice(0, 3).map(requestRow).join("") || '<div class="empty">No hay solicitudes pendientes.</div>'}
        </div>
      </div>
    </article>

    <article class="widget span-4 pinned" id="w-quick-actions" style="min-height:auto;">
      <div class="glow"></div>
      <div class="full-view widget-pad" style="display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap">
        <div>
          <span class="kicker">Acciones Operativas</span>
          <h4 style="color:#fff;margin:2px 0 0;font-size:15px">Herramientas Rápidas</h4>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button type="button" class="btn btn-secondary" onclick="exportCandidatesCsv()">${icon("download", 14)} Descargar Base CSV</button>
          <button type="button" class="btn btn-secondary" onclick="closeExecutiveAdmin();toggleMascotWidget()" style="color:#F18D79;border-color:rgba(241,141,121,0.35);background:rgba(241,141,121,0.12)">🦁 Abrir Calibrador Flotante</button>
          <button type="button" class="btn btn-primary" onclick="openNewRequestModal()">+ Nueva Solicitud</button>
        </div>
      </div>
    </article>
  </div>`;
}

export function updateNotes(val) {
  state.notes = val;
  saveLocalState();
  syncCoreCollectionsToCloud();
}

// ── TAB 2: REQUESTS ──
export function setReqFilter(f) {
  requestFilter = f;
  renderAdmin();
}

export function setRequestViewMode(mode) {
  requestViewMode = mode;
  renderAdmin();
}

export function setReqSearch(val) {
  requestSearch = val;
  const listEl = document.getElementById("filteredRequestsList");
  if (listEl) listEl.innerHTML = getFilteredRequestsHtml();
  refreshIcons();
}

function getFilteredRequestsHtml() {
  const q = requestSearch.trim().toLowerCase();
  const filtered = state.requests.filter((r) => {
    if (requestFilter === "PENDING" && ["APROBADA", "RECHAZADA"].includes(r.status)) return false;
    if (requestFilter === "APPROVED" && r.status !== "APROBADA") return false;
    if (requestFilter === "REJECTED" && r.status !== "RECHAZADA") return false;
    if (requestFilter === "VIDEO" && !r.video) return false;
    if (q) {
      return (
        (r.name || "").toLowerCase().includes(q) ||
        (r.user || "").toLowerCase().includes(q) ||
        (r.id || "").toLowerCase().includes(q) ||
        (r.country || "").toLowerCase().includes(q) ||
        (r.agency || "").toLowerCase().includes(q) ||
        (r.talent || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (!filtered.length) {
    return `<div class="empty">No se encontraron expedientes con ese filtro.</div>`;
  }
  if (requestViewMode === "grid") {
    return `<div class="requests-cards-grid">${filtered.map(requestCardGrid).join("")}</div>`;
  }
  return `<div class="request-list">${filtered.map(requestRow).join("")}</div>`;
}

function renderRequests() {
  const total = state.requests.length;
  const pending = state.requests.filter((r) => !["APROBADA", "RECHAZADA"].includes(r.status)).length;
  const approved = state.requests.filter((r) => r.status === "APROBADA").length;
  const rejected = state.requests.filter((r) => r.status === "RECHAZADA").length;
  const withVideo = state.requests.filter((r) => r.video).length;

  return `<div class="admin-grid">
    <article class="widget span-4 pinned" id="req-main">
      <div class="glow"></div>
      <div class="full-view widget-pad">
        <div class="widget-head" style="flex-wrap:wrap;gap:12px">
          <div><span class="kicker">Talent Acquisition Inbox</span><h3>Gestión de Solicitudes de Streamers</h3></div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <input class="control" style="width:220px;padding:8px 12px;font-size:12px" placeholder="Buscar nombre, @usuario, agencia..." value="${esc(requestSearch)}" oninput="setReqSearch(this.value)" />
            <div style="display:flex;border:1px solid var(--line);border-radius:10px;overflow:hidden;background:rgba(255,255,255,0.03);">
              <button type="button" class="btn mini" style="border:0;border-radius:0;background:${requestViewMode === "grid" ? "var(--primary)" : "transparent"};color:${requestViewMode === "grid" ? "#090a0f" : "var(--muted)"};" onclick="setRequestViewMode('grid')">${icon("layout-grid", 13)} Tarjetas</button>
              <button type="button" class="btn mini" style="border:0;border-radius:0;background:${requestViewMode === "list" ? "var(--primary)" : "transparent"};color:${requestViewMode === "list" ? "#090a0f" : "var(--muted)"};" onclick="setRequestViewMode('list')">${icon("list", 13)} Lista</button>
            </div>
            <button type="button" class="btn btn-secondary mini" onclick="exportCandidatesCsv()">${icon("download", 13)} CSV</button>
            <button type="button" class="btn btn-primary mini" onclick="openNewRequestModal()">+ Nueva Solicitud</button>
          </div>
        </div>

        <div style="display:flex;gap:8px;margin-bottom:16px;overflow-x:auto;padding-bottom:4px">
          <button type="button" class="chip ${requestFilter === "ALL" ? "active-filter" : ""}" onclick="setReqFilter('ALL')">Todas (${total})</button>
          <button type="button" class="chip yellow ${requestFilter === "PENDING" ? "active-filter" : ""}" onclick="setReqFilter('PENDING')">En Revisión (${pending})</button>
          <button type="button" class="chip green ${requestFilter === "APPROVED" ? "active-filter" : ""}" onclick="setReqFilter('APPROVED')">Aprobadas (${approved})</button>
          <button type="button" class="chip red ${requestFilter === "REJECTED" ? "active-filter" : ""}" onclick="setReqFilter('REJECTED')">Declinadas (${rejected})</button>
          <button type="button" class="chip ${requestFilter === "VIDEO" ? "active-filter" : ""}" onclick="setReqFilter('VIDEO')">Con Video (${withVideo})</button>
        </div>

        <div id="filteredRequestsList">${getFilteredRequestsHtml()}</div>
      </div>
    </article>
  </div>`;
}

// ── TAB 3: ACADEMY & TUTORIALS (SYNCED LIVE TO PORTAL 2) ──
function renderTutorialsAdmin() {
  const tuts = state.tutorials?.length
    ? state.tutorials
        .map(
          (t, i) => `
      <div class="request">
        <div class="avatar">${icon(t.type === "pdf" ? "file-text" : "play", 15)}</div>
        <div>
          <strong>${esc(t.title)}</strong>
          <div class="meta">${esc(t.category || "Academia")} · ${esc(t.desc)} · <span class="badge">${esc((t.type || "GUÍA").toUpperCase())}</span></div>
          ${t.url ? `<div style="font-size:11px;color:var(--primary);margin-top:2px;overflow:hidden;text-overflow:ellipsis;max-width:460px;white-space:nowrap">${esc(t.url)}</div>` : ""}
        </div>
        <div class="request-actions">
          <button type="button" class="btn btn-secondary mini" onclick="previewTutorial(${i})">${icon("eye", 13)} Ver</button>
          <button type="button" class="btn btn-danger mini" onclick="removeTutorial(${i})">${icon("trash-2", 13)}</button>
        </div>
      </div>`
        )
        .join("")
    : '<div class="empty">No hay tutoriales publicados. Agrega uno a continuación.</div>';

  return `<div class="admin-grid">
    <article class="widget span-4 pinned">
      <div class="glow"></div>
      <div class="full-view widget-pad">
        <div class="widget-head">
          <div><span class="kicker">Academia StarMaker (Sincronizada con Portal 2)</span><h3>Biblioteca de Tutoriales y Guías Oficiales</h3></div>
        </div>

        <div style="background:rgba(255,255,255,0.02);padding:18px;border-radius:16px;border:1px solid var(--line);margin-bottom:20px;">
          <h4 style="color:#fff;margin:0 0 12px;font-size:14px;">+ Publicar Nuevo Recurso en Academia</h4>
          <div class="form-grid" style="margin-bottom:12px">
            <div class="field"><label for="tutTitle">Título del Tutorial / Guía *</label><input class="control" id="tutTitle" placeholder="Ej. Estrategia Avanzada de Batallas PK" /></div>
            <div class="field">
              <label for="tutCat">Fila / Categoría en Portal 2</label>
              <select class="control" id="tutCat">
                <option value="Fundamentos del Live">Fundamentos del Live</option>
                <option value="Monetización y Batallas PK">Monetización y Batallas PK</option>
                <option value="Guías y Documentos Oficiales">Guías y Documentos Oficiales</option>
              </select>
            </div>
            <div class="field"><label for="tutDesc">Descripción Breve</label><input class="control" id="tutDesc" placeholder="Ej. Paso a paso para maximizar bonos" /></div>
            <div class="field"><label for="tutDuration">Duración / Etiqueta</label><input class="control" id="tutDuration" placeholder="Ej. 06:30 o PDF" /></div>
            <div class="field full">
              <label for="tutUrlInput">URL del Video (YouTube / MP4 / WebM) o Documento PDF</label>
              <div style="display:flex;gap:8px;flex-wrap:wrap">
                <input class="control" id="tutUrlInput" style="flex:1;min-width:200px" placeholder="https://youtube.com/... o sube un archivo →" />
                <label class="btn btn-secondary" style="white-space:nowrap;cursor:pointer">
                  ${icon("upload", 13)} Subir Archivo
                  <input type="file" accept="video/webm,video/mp4,application/pdf" style="display:none" onchange="uploadTutorialFile(this.files[0])" />
                </label>
              </div>
            </div>
          </div>
          <button type="button" class="btn btn-primary" onclick="addTutorialByUrl()">${icon("plus", 14)} Añadir Recurso a Portal 2</button>
        </div>

        <h4 style="color:#fff;margin:0 0 14px;font-size:14px;">Recursos Publicados en Portal 2 (${state.tutorials?.length || 0})</h4>
        <div class="request-list">${tuts}</div>
      </div>
    </article>
  </div>`;
}

export async function uploadTutorialFile(file) {
  if (!file) return;
  const title = document.getElementById("tutTitle")?.value.trim() || file.name.replace(/\.[^.]+$/, "");
  const desc = document.getElementById("tutDesc")?.value.trim() || "Recurso oficial Academia StarMaker";
  const category = document.getElementById("tutCat")?.value || "Guías y Documentos Oficiales";
  const type = file.type.includes("pdf") ? "pdf" : "video";
  const duration = document.getElementById("tutDuration")?.value.trim() || (type === "pdf" ? "PDF" : "VIDEO");

  toast("Subiendo recurso", "Procesando archivo...");
  try {
    const url = await uploadFileUniversal(file);
    state.tutorials.unshift({
      id: "tut-" + Date.now(),
      title,
      desc,
      category,
      duration,
      badge: "Nuevo",
      progress: 100,
      type,
      url
    });
    addActivity("Tutorial publicado", title);
    syncCoreCollectionsToCloud();
    renderAdmin();
    toast("Publicado en Academia", title);
  } catch (e) {
    toast("Error", e.message);
  }
}

export function addTutorialByUrl() {
  const title = document.getElementById("tutTitle")?.value.trim();
  const desc = document.getElementById("tutDesc")?.value.trim() || "Recurso oficial Academia StarMaker";
  const category = document.getElementById("tutCat")?.value || "Fundamentos del Live";
  const url = document.getElementById("tutUrlInput")?.value.trim() || "";
  if (!title) return toast("Falta el título", "Escribe un título para el recurso.");
  if (!url) return toast("Falta URL o archivo", "Pega un enlace válido o usa 'Subir Archivo'.");

  const type = /\.pdf($|\?)/i.test(url) ? "pdf" : "video";
  const duration = document.getElementById("tutDuration")?.value.trim() || (type === "pdf" ? "PDF" : "VIDEO");

  state.tutorials.unshift({
    id: "tut-" + Date.now(),
    title,
    desc,
    category,
    duration,
    badge: "Nuevo",
    progress: 100,
    type,
    url
  });
  addActivity("Tutorial añadido", title);
  syncCoreCollectionsToCloud();
  renderAdmin();
  toast("Recurso añadido a Portal 2", title);
}

export function previewTutorial(i) {
  const t = state.tutorials?.[i];
  if (!t) return;
  closeExecutiveAdmin();
  window.irAlPuntoActual?.();
  window.abrirRecursoAcademia?.(i);
}

export function removeTutorial(i) {
  if (!state.tutorials?.[i]) return;
  const title = state.tutorials[i].title || "Tutorial";
  state.tutorials.splice(i, 1);
  addActivity("Tutorial eliminado", title);
  syncCoreCollectionsToCloud();
  renderAdmin();
  toast("Recurso eliminado", title);
}

// ── TAB 4: SUPPORT & WHATSAPP (SINGLE CLEAN IMPLEMENTATION SYNCED TO PORTAL 3) ──
export function setTicketFilter(f) {
  ticketFilter = f;
  renderAdmin();
}

export function openNewTicketModal() {
  const nameEl = document.getElementById("ntName");
  const msgEl = document.getElementById("ntMsg");
  if (nameEl) nameEl.value = "";
  if (msgEl) msgEl.value = "";
  const sel = document.getElementById("ntCat");
  if (sel) {
    sel.innerHTML = (state.supportContacts || [])
      .map((c) => `<option value="${esc(c.name)}">${esc(c.name)}</option>`)
      .join("");
  }
  openModal("newTicketModal");
}

export function createNewTicket() {
  const name = (document.getElementById("ntName")?.value || "").trim();
  const cat = document.getElementById("ntCat")?.value || "Soporte General";
  const msg = (document.getElementById("ntMsg")?.value || "").trim();
  if (!name || !msg) return toast("Campos requeridos", "Ingresa nombre y mensaje.");

  const id = "TICK-" + Math.floor(1000 + Math.random() * 8999);
  if (!Array.isArray(state.tickets)) state.tickets = [];
  state.tickets.unshift({
    id,
    name,
    cat,
    msg,
    status: "ABIERTO",
    date: new Date().toLocaleDateString("es-MX")
  });
  addActivity("Ticket creado en consola", `${name} · ${id}`);
  closeModal("newTicketModal");
  renderAdmin();
  toast("Ticket registrado", `${name} (${id})`);
}

export function toggleTicketStatus(id) {
  const t = (state.tickets || []).find((x) => x.id === id);
  if (!t) return;
  t.status = t.status === "RESUELTO" ? "ABIERTO" : "RESUELTO";
  addActivity(`Ticket ${t.status.toLowerCase()}`, `${t.name} · ${t.id}`);
  toast("Estado de ticket", `${t.id} → ${t.status}`);
  renderAdmin();
}

export function deleteTicket(id) {
  const idx = (state.tickets || []).findIndex((x) => x.id === id);
  if (idx === -1) return;
  state.tickets.splice(idx, 1);
  addActivity("Ticket eliminado", id);
  renderAdmin();
  toast("Ticket eliminado", id);
}

export function addSupportContact() {
  if (!Array.isArray(state.supportContacts)) state.supportContacts = [];
  state.supportContacts.push({
    id: "oficial_" + Date.now(),
    name: "Nuevo Oficial Ejecutivo",
    role: "Atención Especializada",
    avatar: "💎",
    whatsapp: "",
    email: ""
  });
  addActivity("Oficial de soporte añadido");
  syncCoreCollectionsToCloud();
  renderAdmin();
  toast("Oficial añadido", "Ingresa su número de WhatsApp para activarlo en Portal 3.");
}

export function editSupport(i, key, val) {
  if (!state.supportContacts?.[i]) return;
  state.supportContacts[i][key] = val.trim();
  saveLocalState();
  syncSupportToPortal();
  syncCoreCollectionsToCloud();
  toast("Asesor actualizado", `${state.supportContacts[i].name}`);
}

export function removeSupportContact(i) {
  if (!state.supportContacts?.[i]) return;
  const name = state.supportContacts[i].name || "Asesor";
  state.supportContacts.splice(i, 1);
  addActivity("Oficial de soporte eliminado", name);
  syncCoreCollectionsToCloud();
  renderAdmin();
  toast("Asesor eliminado", name);
}

function renderSupportAdmin() {
  const filtered = (state.tickets || []).filter((t) => {
    if (ticketFilter === "OPEN") return t.status !== "RESUELTO";
    if (ticketFilter === "RESOLVED") return t.status === "RESUELTO";
    return true;
  });

  const contactsHtml = (state.supportContacts || [])
    .map(
      (c, i) => `
      <div class="request">
        <div class="avatar">${c.avatar && c.avatar.length <= 4 ? esc(c.avatar) : icon("user-check", 16)}</div>
        <div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:8px;margin-bottom:8px">
            <input class="control" style="padding:7px 10px;font-size:12px" value="${esc(c.name)}" placeholder="Nombre oficial" onchange="editSupport(${i},'name',this.value)" />
            <input class="control" style="padding:7px 10px;font-size:12px" value="${esc(c.role)}" placeholder="Departamento / Rol" onchange="editSupport(${i},'role',this.value)" />
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:8px">
            <input class="control" style="padding:7px 10px;font-size:12px" value="${esc(c.whatsapp)}" placeholder="WhatsApp con lada (Ej. 5215512345678)" onchange="editSupport(${i},'whatsapp',this.value)" />
            <input class="control" style="padding:7px 10px;font-size:12px" value="${esc(c.email || "")}" placeholder="Correo electrónico" onchange="editSupport(${i},'email',this.value)" />
          </div>
        </div>
        <div class="request-actions">
          <button type="button" class="btn btn-danger mini" onclick="removeSupportContact(${i})" title="Eliminar">${icon("trash-2", 13)}</button>
        </div>
      </div>`
    )
    .join("");

  const ticketsHtml = filtered.length
    ? filtered
        .map(
          (t) => `
        <div class="request">
          <div class="avatar">${icon("message-square", 16)}</div>
          <div>
            <strong>${esc(t.name)}</strong>
            <div class="meta">${esc(t.cat)} · <span style="color:var(--primary)">${esc(t.id)}</span> · ${esc(t.date || "")}</div>
            <p style="font-size:12.5px;color:var(--text);margin:6px 0 0">${esc(t.msg)}</p>
          </div>
          <div class="request-actions">
            <button type="button" class="chip ${t.status === "RESUELTO" ? "green" : "yellow"}" onclick="toggleTicketStatus('${esc(t.id)}')">${esc(t.status)}</button>
            <button type="button" class="btn btn-danger mini" onclick="deleteTicket('${esc(t.id)}')">${icon("trash-2", 13)}</button>
          </div>
        </div>`
        )
        .join("")
    : '<div class="empty">No hay tickets en este estado.</div>';

  return `<div class="admin-grid">
    <article class="widget span-4 pinned">
      <div class="glow"></div>
      <div class="full-view widget-pad">
        <div class="widget-head">
          <div><span class="kicker">Atención al Creador (Conectado a Portal 3)</span><h3>Directorio de Asesores WhatsApp</h3></div>
          <button type="button" class="btn btn-primary mini" onclick="addSupportContact()">+ Nuevo Asesor</button>
        </div>
        <p style="color:var(--muted);font-size:12px;margin:-6px 0 16px;">Estos asesores alimentan automáticamente los botones de WhatsApp, el selector de departamentos y 'Hablar con Agente' en Portal 3.</p>
        <div class="request-list" style="margin-bottom:26px">${contactsHtml}</div>

        <div class="widget-head" style="margin-top:20px;border-top:1px solid var(--line);padding-top:20px;flex-wrap:wrap;">
          <div><span class="kicker">Mesa Concierge</span><h3>Tickets Recibidos desde Portal 3</h3></div>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            <button type="button" class="chip ${ticketFilter === "ALL" ? "active-filter" : ""}" onclick="setTicketFilter('ALL')">Todos (${state.tickets?.length || 0})</button>
            <button type="button" class="chip yellow ${ticketFilter === "OPEN" ? "active-filter" : ""}" onclick="setTicketFilter('OPEN')">Abiertos (${(state.tickets || []).filter((t) => t.status !== "RESUELTO").length})</button>
            <button type="button" class="chip green ${ticketFilter === "RESOLVED" ? "active-filter" : ""}" onclick="setTicketFilter('RESOLVED')">Resueltos (${(state.tickets || []).filter((t) => t.status === "RESUELTO").length})</button>
            <button type="button" class="btn btn-secondary mini" onclick="openNewTicketModal()">+ Ticket</button>
          </div>
        </div>
        <div class="request-list">${ticketsHtml}</div>
      </div>
    </article>
  </div>`;
}

// ── TAB 5: SETTINGS & BACKUP ──
function renderSettings() {
  return `<div class="admin-grid">
    <article class="widget span-4 pinned">
      <div class="glow"></div>
      <div class="full-view widget-pad">
        <div class="widget-head">
          <div><span class="kicker">Identidad y Operaciones</span><h3>Configuración Master</h3></div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:18px;">
          <div style="background:rgba(255,255,255,0.02);padding:18px;border-radius:16px;border:1px solid var(--line);">
            <h4 style="color:#fff;margin:0 0 6px;font-size:14px;">Redes Sociales Oficiales</h4>
            <p style="color:var(--muted);font-size:11.5px;margin-bottom:14px;">Se actualizan en vivo al pie del Portal 3 de Soporte.</p>
            <div class="field" style="margin-bottom:10px">
              <label>Instagram Oficial</label>
              <input class="control" placeholder="https://instagram.com/..." value="${esc(state.socials?.instagram || "")}" onchange="updateSocial('instagram',this.value)" />
            </div>
            <div class="field" style="margin-bottom:10px">
              <label>TikTok Oficial</label>
              <input class="control" placeholder="https://tiktok.com/..." value="${esc(state.socials?.tiktok || "")}" onchange="updateSocial('tiktok',this.value)" />
            </div>
            <div class="field">
              <label>Facebook Oficial</label>
              <input class="control" placeholder="https://facebook.com/..." value="${esc(state.socials?.facebook || "")}" onchange="updateSocial('facebook',this.value)" />
            </div>
          </div>

          <div style="background:rgba(255,255,255,0.02);padding:18px;border-radius:16px;border:1px solid var(--line);display:flex;flex-direction:column;justify-content:space-between;gap:14px;">
            <div>
              <h4 style="color:#fff;margin:0 0 8px;font-size:14px;">Mascota 3D & Respaldo Maestro</h4>
              <p style="color:var(--muted);font-size:12px;margin-bottom:14px;">Calibra los videos de StarLeo sobre el escenario 3D o descarga una copia completa de seguridad.</p>
              <button type="button" class="btn btn-secondary" onclick="closeExecutiveAdmin();toggleMascotWidget();" style="width:100%;margin-bottom:12px;background:rgba(241,141,121,0.14);border-color:rgba(241,141,121,0.35);color:#F18D79;">
                🦁 Abrir Calibrador Flotante de Mascota
              </button>
              <div style="display:flex;gap:10px;flex-wrap:wrap">
                <button type="button" class="btn btn-secondary" style="flex:1" onclick="exportBackupJson()">${icon("download", 13)} Exportar JSON</button>
                <label class="btn btn-secondary" style="flex:1;cursor:pointer;text-align:center">
                  ${icon("upload", 13)} Restaurar JSON
                  <input type="file" accept=".json" style="display:none" onchange="importBackupJson(this.files[0])" />
                </label>
              </div>
            </div>
            <div style="border-top:1px solid var(--line);padding-top:12px;display:flex;justify-content:flex-end;">
              <button type="button" class="btn btn-danger mini" onclick="resetDemo()">${icon("rotate-ccw", 13)} Restaurar Valores de Fábrica</button>
            </div>
          </div>
        </div>
      </div>
    </article>
  </div>`;
}

export function updateSocial(net, val) {
  if (!state.socials) state.socials = {};
  state.socials[net] = val.trim();
  addActivity("Red social actualizada", net);
  syncSocialsToPortal();
  syncCoreCollectionsToCloud();
  toast("Red oficial guardada", net);
}

export function exportBackupJson() {
  const filename = `STARMAKER_BACKUP_${new Date().toISOString().slice(0, 10)}.json`;
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
  toast("Respaldo descargado", filename);
}

export function importBackupJson(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result || "{}"));
      replaceFullState(parsed);
      syncMascotStageFromState();
      renderMascotControls();
      renderAdmin();
      syncCoreCollectionsToCloud();
      toast("Respaldo restaurado", "Todos los datos fueron importados con éxito.");
    } catch (_) {
      toast("Archivo inválido", "El archivo JSON no tiene un formato válido.");
    }
  };
  reader.readAsText(file);
}

export function resetDemo() {
  if (!confirm("¿Restaurar la consola a sus valores originales de fábrica?")) return;
  replaceFullState(clone(DEFAULT_STATE));
  syncMascotStageFromState();
  renderMascotControls();
  renderAdmin();
  toast("Consola restaurada", "Valores iniciales restablecidos.");
}

export function exportCandidatesCsv() {
  let csv = "\uFEFFID,Nombre,Usuario,Pais,Ciudad,Estado,Video,VideoURL,Fecha,Email,Telefono,Agencia,AgenteID,Talento,Plataformas\n";
  const safe = (s) => `"${String(s || "").replace(/"/g, '""')}"`;
  (state.requests || []).forEach((r) => {
    csv +=
      [
        safe(r.id),
        safe(r.name),
        safe(r.user),
        safe(r.country),
        safe(r.city),
        safe(r.status),
        safe(r.video ? "SI" : "NO"),
        safe(r.videoUrl),
        safe(r.date),
        safe(r.email),
        safe(r.phone),
        safe(r.agency),
        safe(r.agentId),
        safe(r.talent),
        safe(r.platform)
      ].join(",") + "\n";
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  a.download = `StarMaker_Candidatos_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  toast("Descarga completada", "Base de candidatos exportada a CSV.");
}

// ── RENDER & CONTROLLER ──
export function renderAdmin() {
  const v = document.getElementById("adminView");
  if (v) {
    if (adminTab === "overview") v.innerHTML = renderOverview();
    else if (adminTab === "requests") v.innerHTML = renderRequests();
    else if (adminTab === "tutorials") v.innerHTML = renderTutorialsAdmin();
    else if (adminTab === "support") v.innerHTML = renderSupportAdmin();
    else if (adminTab === "settings") v.innerHTML = renderSettings();
  }

  document.querySelectorAll(".admin-tab").forEach((b) => b.classList.toggle("active", b.dataset.tab === adminTab));
  document.querySelectorAll("#adminBottom button").forEach((b) => b.classList.toggle("active", b.dataset.tab === adminTab));

  refreshIcons();
  syncTutorialsToPortal();
  syncSupportToPortal();
  syncSocialsToPortal();
}

export function setAdminTab(t) {
  adminTab = t;
  renderAdmin();
  document.getElementById("adminExecutiveOverlay")?.scrollTo({ top: 0, behavior: "smooth" });
}

export function openExecutiveAdmin() {
  const overlay = document.getElementById("adminExecutiveOverlay");
  if (!overlay) return;
  overlay.style.display = "block";
  overlay.classList.add("is-open");
  renderAdmin();
}

export function closeExecutiveAdmin() {
  const overlay = document.getElementById("adminExecutiveOverlay");
  if (!overlay) return;
  overlay.classList.remove("is-open");
  overlay.style.display = "none";
}

export function initExecutiveConsole() {
  document.getElementById("adminTabs")?.addEventListener("click", (e) => {
    const b = e.target.closest("[data-tab]");
    if (b) setAdminTab(b.dataset.tab);
  });

  document.getElementById("adminBottom")?.addEventListener("click", (e) => {
    const b = e.target.closest("[data-tab]");
    if (b) setAdminTab(b.dataset.tab);
  });

  syncTutorialsToPortal();
  syncSupportToPortal();
  syncSocialsToPortal();
  refreshIcons();
}
