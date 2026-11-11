const fs = require("fs");

let content = fs.readFileSync("index.html", "utf8");

// Find exact block from "function renderOverview()" to "function setAdminTab(t)"
const startTarget = "function renderOverview() {";
const endTarget = "function setAdminTab(t) {";

const sIdx = content.indexOf(startTarget);
const eIdx = content.indexOf(endTarget);

if (sIdx === -1 || eIdx === -1) {
  console.error("Could not find start or end target for admin tab refactoring!");
  process.exit(1);
}

const cleanAdminJs = `function renderOverview() {
  const total = state.requests.length;
  const pending = state.requests.filter(r => !["APROBADA", "RECHAZADA"].includes(r.status)).length;
  const approved = state.requests.filter(r => r.status === "APROBADA").length;
  const withVideo = state.requests.filter(r => r.video).length;
  const tutCount = state.tutorials?.length || 0;
  const openTickets = (state.tickets || []).filter(t => t.status !== "RESUELTO").length;

  return \`<div class="admin-grid">
    \${widget("w-kpi", "EXPEDIENTES TOTALES", "Postulaciones recibidas", \`<div class="kpi">\${total}</div><div style="color:var(--muted);font-size:11px;margin-top:10px">\${withVideo} videos de verificación · \${tutCount} guías</div>\`, 'data-kpi="' + total + '"')}
    \${widget("w-pending", "POR DICTAMINAR", "En espera de revisión", \`<div class="kpi">\${pending}</div><div class="progress-bar" style="margin-top:16px"><span style="width:\${Math.min(100, pending * 25)}%"></span></div>\`, 'data-kpi="' + pending + '"')}
    \${widget("w-approved", "TALENTOS APROBADOS", "Streamers oficiales", \`<div class="kpi">\${approved}</div><div style="color:var(--muted);font-size:11px;margin-top:10px">Creadores certificados</div>\`, 'data-kpi="' + approved + '"')}
    \${widget("w-tickets", "CONCIERGE DESK", "Tickets de creadores", \`<div class="kpi">\${openTickets}</div><div style="color:var(--muted);font-size:11px;margin-top:10px">\${state.tickets?.length || 0} consultas en total</div>\`, 'data-kpi="' + openTickets + '"')}

    <article class="widget span-2" id="w-notes">
      <div class="glow"></div>
      <div class="full-view widget-pad">
        <div class="widget-head">
          <div><span class="kicker">Directrices y Turnos</span><h3>Bitácora Estratégica</h3></div>
        </div>
        <div class="field" style="margin:6px 0;height:calc(100% - 20px)">
          <textarea class="control" style="height:140px;resize:none;line-height:1.6" placeholder="Escribe aquí las directrices y notas del equipo..." oninput="updateNotes(this.value)">\${esc(state.notes || "")}</textarea>
        </div>
      </div>
    </article>

    <article class="widget span-2" id="w-inbox-preview">
      <div class="glow"></div>
      <div class="full-view widget-pad">
        <div class="widget-head">
          <div><span class="kicker">Talent Acquisition</span><h3>Bandeja Prioritaria</h3></div>
          <button class="btn btn-secondary mini" onclick="setAdminTab('requests')">Ver Todas →</button>
        </div>
        <div class="request-list">
          \${state.requests.slice(0, 3).map(requestRow).join("") || '<div class="empty">No hay solicitudes pendientes.</div>'}
        </div>
      </div>
    </article>

    <article class="widget span-4" id="w-quick-actions">
      <div class="glow"></div>
      <div class="full-view widget-pad" style="display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap">
        <div>
          <span class="kicker">Acciones Operativas</span>
          <h4 style="color:#fff;margin:2px 0 0;font-size:15px">Herramientas Rápidas</h4>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn btn-secondary" onclick="exportCandidatesCsv()"><i data-lucide="download" width="14"></i> Descargar Base CSV</button>
          <button class="btn btn-secondary" onclick="closeExecutiveAdmin();toggleMascotWidget()" style="color:#F18D79;border-color:rgba(241,141,121,0.35);background:rgba(241,141,121,0.12)">🦁 Abrir Calibrador Flotante</button>
          <button class="btn btn-primary" onclick="openNewRequestModal()">+ Nueva Solicitud</button>
        </div>
      </div>
    </article>
  </div>\`;
}

window.updateNotes = (val) => { state.notes = val; save(); };

function setReqFilter(f) {
  requestFilter = f;
  renderAdmin();
}
function setReqSearch(val) {
  requestSearch = val;
  const listEl = document.getElementById("filteredRequestsList");
  if (listEl) listEl.innerHTML = getFilteredRequestsHtml();
  icons();
}
function getFilteredRequestsHtml() {
  const q = requestSearch.trim().toLowerCase();
  const filtered = state.requests.filter(r => {
    if (requestFilter === "PENDING" && ["APROBADA", "RECHAZADA"].includes(r.status)) return false;
    if (requestFilter === "APPROVED" && r.status !== "APROBADA") return false;
    if (requestFilter === "REJECTED" && r.status !== "RECHAZADA") return false;
    if (requestFilter === "VIDEO" && !r.video) return false;
    if (q) {
      return (r.name || "").toLowerCase().includes(q) ||
             (r.user || "").toLowerCase().includes(q) ||
             (r.id || "").toLowerCase().includes(q) ||
             (r.country || "").toLowerCase().includes(q);
    }
    return true;
  });
  return filtered.length ? filtered.map(requestRow).join("") : \`<div class="empty">No se encontraron expedientes con ese filtro.</div>\`;
}

function renderRequests() {
  const total = state.requests.length;
  const pending = state.requests.filter(r => !["APROBADA", "RECHAZADA"].includes(r.status)).length;
  const approved = state.requests.filter(r => r.status === "APROBADA").length;
  const withVideo = state.requests.filter(r => r.video).length;

  return \`<div class="admin-grid">
    <article class="widget span-4" id="req-main">
      <div class="glow"></div>
      <div class="full-view widget-pad">
        <div class="widget-head" style="flex-wrap:wrap;gap:12px">
          <div><span class="kicker">Talent Acquisition Inbox</span><h3>Gestión de Solicitudes de Streamers</h3></div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <input class="control" style="width:220px;padding:8px 12px;font-size:12px" placeholder="Buscar nombre, @usuario, ID..." value="\${esc(requestSearch)}" oninput="setReqSearch(this.value)">
            <button class="btn btn-secondary mini" onclick="exportCandidatesCsv()" title="Exportar CSV">\${icon("download", 13)} CSV</button>
            <button class="btn btn-primary mini" onclick="openNewRequestModal()">+ Nueva Solicitud</button>
          </div>
        </div>
        <div style="display:flex;gap:8px;margin-bottom:16px;overflow:auto;padding-bottom:4px">
          <button type="button" class="chip \${requestFilter === 'ALL' ? 'active-filter' : ''}" onclick="setReqFilter('ALL')">Todas (\${total})</button>
          <button type="button" class="chip yellow \${requestFilter === 'PENDING' ? 'active-filter' : ''}" onclick="setReqFilter('PENDING')">En Revisión (\${pending})</button>
          <button type="button" class="chip green \${requestFilter === 'APPROVED' ? 'active-filter' : ''}" onclick="setReqFilter('APPROVED')">Aprobadas (\${approved})</button>
          <button type="button" class="chip \${requestFilter === 'VIDEO' ? 'active-filter' : ''}" onclick="setReqFilter('VIDEO')">Con Video (\${withVideo})</button>
        </div>
        <div class="request-list" id="filteredRequestsList">\${getFilteredRequestsHtml()}</div>
      </div>
    </article>
  </div>\`;
}

// ── TAB: ACADEMIA & TUTORIALES (PORTAL 2) ────────────────────────────────────
function renderTutorialsAdmin() {
  const tuts = (state.tutorials && state.tutorials.length) ? state.tutorials.map((t, i) => \`
    <div class="request" style="grid-template-columns:auto 1fr auto">
      <div class="avatar">\${icon(t.type === 'pdf' ? 'file-text' : 'play', 15)}</div>
      <div>
        <strong>\${esc(t.title)}</strong>
        <div class="meta">\${esc(t.desc)} · <span class="badge">\${(t.type || 'VIDEO').toUpperCase()}</span></div>
        <div style="font-size:11px;color:var(--primary);margin-top:2px;overflow:hidden;text-overflow:ellipsis;max-width:400px;white-space:nowrap">\${esc(t.url)}</div>
      </div>
      <div style="display:flex;gap:6px">
        <button class="btn btn-secondary mini" onclick="previewTutorial(\${i})" title="Previsualizar">\${icon("eye", 13)} Ver</button>
        <button class="btn btn-danger mini" onclick="removeTutorial(\${i})" title="Eliminar">\${icon("trash-2", 13)}</button>
      </div>
    </div>\`).join("") : '<div class="empty">No hay tutoriales publicados. Agrega uno a continuación.</div>';

  return \`<div class="admin-grid">
    <article class="widget span-4">
      <div class="glow"></div>
      <div class="full-view widget-pad">
        <div class="widget-head">
          <div><span class="kicker">Academia StarMaker (Portal 2)</span><h3>Biblioteca de Tutoriales y Guías Oficiales</h3></div>
        </div>
        
        <div style="background:rgba(255,255,255,0.02);padding:18px;border-radius:16px;border:1px solid var(--line);margin-bottom:20px;">
          <h4 style="color:#fff;margin:0 0 12px;font-size:14px;">+ Publicar Nuevo Recurso en Academia</h4>
          <div class="form-grid" style="margin-bottom:12px">
            <div class="field"><label>Título del Tutorial / Guía *</label><input class="control" id="tutTitle" placeholder="Ej. Guía Oficial de Emisión y Batallas PK"></div>
            <div class="field"><label>Descripción Breve</label><input class="control" id="tutDesc" placeholder="Ej. Requisitos técnicos para streamers"></div>
            <div class="field full"><label>URL del Video (YouTube / MP4 / WebM) o Enlace PDF</label>
              <div style="display:flex;gap:8px">
                <input class="control" id="tutUrlInput" placeholder="https://...">
                <label class="btn btn-secondary" style="white-space:nowrap;cursor:pointer">
                  \${icon("upload", 13)} Subir Archivo
                  <input type="file" accept="video/webm,video/mp4,application/pdf" style="display:none" onchange="uploadTutorialFile(this.files[0])">
                </label>
              </div>
            </div>
          </div>
          <button class="btn btn-primary" onclick="addTutorialByUrl()">\${icon("plus", 14)} Añadir Recurso a Portal 2</button>
        </div>

        <h4 style="color:#fff;margin:0 0 14px;font-size:14px;">Recursos Actualmente Publicados (\${state.tutorials?.length || 0})</h4>
        <div class="request-list">\${tuts}</div>
      </div>
    </article>
  </div>\`;
}

// ── TAB: SOPORTE & ASESORES WHATSAPP (PORTAL 3) ──────────────────────────────
function openNewTicketModal() {
  const nameEl = document.getElementById("ntName");
  const msgEl = document.getElementById("ntMsg");
  if (nameEl) nameEl.value = "";
  if (msgEl) msgEl.value = "";
  const sel = document.getElementById("ntCat");
  if (sel) sel.innerHTML = (state.supportContacts || []).map(c => \`<option value="\${esc(c.name)}">\${esc(c.name)}</option>\`).join("");
  openModal("newTicketModal");
}

function createNewTicket() {
  const name = (document.getElementById("ntName")?.value || "").trim();
  const cat = document.getElementById("ntCat")?.value || "Soporte General";
  const msg = (document.getElementById("ntMsg")?.value || "").trim();
  if (!name || !msg) return toast("Campos requeridos", "Ingresa nombre y mensaje del ticket.");

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
  addActivity("Nuevo ticket de soporte registrado", \`\${name} · \${id}\`);
  closeModal("newTicketModal");
  renderAdmin();
  toast("Ticket registrado", \`\${name} (\${id})\`);
}

function toggleTicketStatus(id) {
  const t = (state.tickets || []).find(x => x.id === id);
  if (!t) return;
  t.status = t.status === "RESUELTO" ? "ABIERTO" : "RESUELTO";
  addActivity(\`Ticket \${t.status.toLowerCase()}\`, \`\${t.name} · \${t.id}\`);
  toast("Estado de ticket", \`\${t.id} → \${t.status}\`);
  renderAdmin();
}

function deleteTicket(id) {
  const idx = (state.tickets || []).findIndex(x => x.id === id);
  if (idx === -1) return;
  state.tickets.splice(idx, 1);
  addActivity("Ticket eliminado", id);
  renderAdmin();
  toast("Ticket eliminado", id);
}

function addSupportContact() {
  if (!Array.isArray(state.supportContacts)) state.supportContacts = [];
  state.supportContacts.push({
    id: "oficial_" + (state.supportContacts.length + 1),
    name: "Nuevo Oficial Ejecutivo",
    role: "Atención Especializada",
    avatar: "💎",
    whatsapp: "",
    email: "",
    issues: "Consultas, Soporte"
  });
  addActivity("Oficial de soporte añadido");
  renderAdmin();
  toast("Oficial añadido");
}

function editSupport(i, key, val) {
  if (!state.supportContacts || !state.supportContacts[i]) return;
  state.supportContacts[i][key] = val;
  save();
  syncSupportToPortal();
}

function removeSupportContact(i) {
  if (!state.supportContacts || !state.supportContacts[i]) return;
  const name = state.supportContacts[i].name || "";
  state.supportContacts.splice(i, 1);
  addActivity("Oficial de soporte eliminado", name);
  renderAdmin();
  toast("Departamento eliminado", name);
}

function renderSupportAdmin() {
  const filtered = (state.tickets || []).filter(t => {
    if (ticketFilter === "OPEN") return t.status !== "RESUELTO";
    if (ticketFilter === "RESOLVED") return t.status === "RESUELTO";
    return true;
  });

  const contactsHtml = (state.supportContacts || []).map((c, i) => \`
    <div class="request" style="grid-template-columns:auto 1fr auto">
      <div class="avatar">\${c.avatar && c.avatar.length <= 4 ? c.avatar : icon("user-check", 16)}</div>
      <div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:6px">
          <input class="control" style="padding:6px 10px;font-size:12px" value="\${esc(c.name)}" placeholder="Nombre oficial" onchange="editSupport(\${i},'name',this.value)">
          <input class="control" style="padding:6px 10px;font-size:12px" value="\${esc(c.role)}" placeholder="Departamento / Rol" onchange="editSupport(\${i},'role',this.value)">
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <input class="control" style="padding:6px 10px;font-size:12px" value="\${esc(c.whatsapp)}" placeholder="WhatsApp (Ej. 5215500000000)" onchange="editSupport(\${i},'whatsapp',this.value)">
          <input class="control" style="padding:6px 10px;font-size:12px" value="\${esc(c.email || '')}" placeholder="Email" onchange="editSupport(\${i},'email',this.value)">
        </div>
      </div>
      <div style="display:flex;gap:6px">
        <button class="btn btn-danger mini" onclick="removeSupportContact(\${i})" title="Eliminar">\${icon("trash-2", 13)}</button>
      </div>
    </div>
  \`).join("");

  const ticketsHtml = filtered.length ? filtered.map(t => \`
    <div class="request">
      <div class="avatar">\${icon("message-square", 16)}</div>
      <div>
        <strong>\${esc(t.name)}</strong>
        <div class="meta">\${esc(t.cat)} · <span style="color:var(--primary)">\${esc(t.id)}</span> · \${esc(t.date || "")}</div>
        <p style="font-size:12px;color:var(--text);margin:6px 0 0">\${esc(t.msg)}</p>
      </div>
      <div class="request-actions">
        <button class="chip \${t.status === "RESUELTO" ? "green" : "yellow"}" onclick="toggleTicketStatus('\${t.id}')">\${esc(t.status)}</button>
        <button class="btn btn-danger mini" onclick="deleteTicket('\${t.id}')">\${icon("trash-2", 13)}</button>
      </div>
    </div>
  \`).join("") : '<div class="empty">No hay tickets en este estado.</div>';

  return \`<div class="admin-grid">
    <article class="widget span-4">
      <div class="glow"></div>
      <div class="full-view widget-pad">
        <div class="widget-head">
          <div><span class="kicker">Atención al Creador (Portal 3)</span><h3>Directorio de Asesores WhatsApp</h3></div>
          <button class="btn btn-primary mini" onclick="addSupportContact()">+ Nuevo Asesor</button>
        </div>
        <p style="color:var(--muted);font-size:12px;margin:-8px 0 16px;">Estos números conectan directamente con el botón "Hablar con Agente" y los enlaces en Portal 3.</p>
        <div class="request-list" style="margin-bottom:28px">\${contactsHtml}</div>

        <div class="widget-head" style="margin-top:20px;border-top:1px solid var(--line);padding-top:20px;">
          <div><span class="kicker">Consultas de Streamers</span><h3>Tickets de Soporte Registrados</h3></div>
          <div style="display:flex;gap:6px">
            <button class="chip \${ticketFilter === 'ALL' ? 'active-filter' : ''}" onclick="setTicketFilter('ALL')">Todos (\${state.tickets?.length || 0})</button>
            <button class="chip yellow \${ticketFilter === 'OPEN' ? 'active-filter' : ''}" onclick="setTicketFilter('OPEN')">Abiertos</button>
            <button class="chip green \${ticketFilter === 'RESOLVED' ? 'active-filter' : ''}" onclick="setTicketFilter('RESOLVED')">Resueltos</button>
            <button class="btn btn-secondary mini" onclick="openNewTicketModal()">+ Ticket</button>
          </div>
        </div>
        <div class="request-list">\${ticketsHtml}</div>
      </div>
    </article>
  </div>\`;
}

// ── TAB: CONFIGURACIÓN & REDES ──────────────────────────────────────────────
function renderSettings() {
  return \`<div class="admin-grid">
    <article class="widget span-4">
      <div class="glow"></div>
      <div class="full-view widget-pad">
        <div class="widget-head">
          <div><span class="kicker">Identidad y Operaciones</span><h3>Configuración Master</h3></div>
        </div>
        
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:18px;margin-bottom:20px">
          <div style="background:rgba(255,255,255,0.02);padding:18px;border-radius:16px;border:1px solid var(--line);">
            <h4 style="color:#fff;margin:0 0 14px;font-size:14px;">Redes Sociales Oficiales</h4>
            <div class="field" style="margin-bottom:10px">
              <label>Instagram Oficial</label>
              <input class="control" placeholder="https://instagram.com/..." value="\${esc(state.socials?.instagram || '')}" onchange="updateSocial('instagram',this.value)">
            </div>
            <div class="field" style="margin-bottom:10px">
              <label>TikTok Oficial</label>
              <input class="control" placeholder="https://tiktok.com/..." value="\${esc(state.socials?.tiktok || '')}" onchange="updateSocial('tiktok',this.value)">
            </div>
            <div class="field">
              <label>Facebook Oficial</label>
              <input class="control" placeholder="https://facebook.com/..." value="\${esc(state.socials?.facebook || '')}" onchange="updateSocial('facebook',this.value)">
            </div>
          </div>

          <div style="background:rgba(255,255,255,0.02);padding:18px;border-radius:16px;border:1px solid var(--line);">
            <h4 style="color:#fff;margin:0 0 14px;font-size:14px;">Mascota 3D & Respaldo de Datos</h4>
            <p style="color:var(--muted);font-size:12px;margin-bottom:16px;">Para calibrar y subir los videos de StarLeo en tiempo real sobre el Showroom, utiliza el Calibrador Flotante.</p>
            <button class="btn btn-secondary" onclick="closeExecutiveAdmin();toggleMascotWidget();" style="width:100%;margin-bottom:14px;background:rgba(241,141,121,0.15);border-color:rgba(241,141,121,0.35);color:#F18D79;">
              🦁 Abrir Calibrador Flotante de Mascota
            </button>
            <div style="display:flex;gap:10px">
              <button class="btn btn-secondary" style="flex:1" onclick="exportBackupJson()">\${icon("download", 13)} Exportar JSON</button>
              <label class="btn btn-secondary" style="flex:1;cursor:pointer;text-align:center">
                \${icon("upload", 13)} Restaurar JSON
                <input type="file" accept=".json" style="display:none" onchange="importBackupJson(this.files[0])">
              </label>
            </div>
          </div>
        </div>
      </div>
    </article>
  </div>\`;
}

// ── MAIN RENDER & TAB CONTROLLER ─────────────────────────────────────────────
function renderAdmin() {
  applySavedTheme();
  const v = document.getElementById("adminView");
  if (v) {
    if (adminTab === "overview") v.innerHTML = renderOverview();
    if (adminTab === "requests") v.innerHTML = renderRequests();
    if (adminTab === "tutorials") v.innerHTML = renderTutorialsAdmin();
    if (adminTab === "support") v.innerHTML = renderSupportAdmin();
    if (adminTab === "settings") v.innerHTML = renderSettings();
  }
  document.querySelectorAll(".admin-tab").forEach(b => b.classList.toggle("active", b.dataset.tab === adminTab));
  document.querySelectorAll("#adminBottom button").forEach(b => b.classList.toggle("active", b.dataset.tab === adminTab));
  icons();
  syncTutorialsToPortal();
  syncSupportToPortal();
}

// ── FLOATING MASCOT WIDGET TOGGLE & DRAG ──────────────────────────────────────
window.toggleMascotWidget = function() {
  const w = document.getElementById('mascot-widget');
  if (!w) return;
  if (w.classList.contains('is-open')) {
    w.classList.remove('is-open');
    w.style.display = 'none';
  } else {
    w.style.display = 'flex';
    w.classList.add('is-open');
  }
};

window.closeMascotWidget = function() {
  const w = document.getElementById('mascot-widget');
  if (!w) return;
  w.classList.remove('is-open');
  w.style.display = 'none';
};

const mascotWidget = document.getElementById('mascot-widget');
const mascotHeader = document.getElementById('mascot-widget-header');
let isMascotDragging = false, mStartX, mStartY, mStartLeft, mStartTop;

if (mascotHeader && mascotWidget) {
  mascotHeader.addEventListener('mousedown', (e) => {
    if (e.target.id === 'btn-close-mascot') return;
    isMascotDragging = true;
    mStartX = e.clientX;
    mStartY = e.clientY;
    const rect = mascotWidget.getBoundingClientRect();
    mStartLeft = rect.left;
    mStartTop = rect.top;
    document.body.style.userSelect = 'none';
  });
  window.addEventListener('mousemove', (e) => {
    if (!isMascotDragging) return;
    const dx = e.clientX - mStartX;
    const dy = e.clientY - mStartY;
    mascotWidget.style.left = (mStartLeft + dx) + 'px';
    mascotWidget.style.top = (mStartTop + dy) + 'px';
    mascotWidget.style.right = 'auto';
  });
  window.addEventListener('mouseup', () => {
    isMascotDragging = false;
    document.body.style.userSelect = '';
  });

  mascotHeader.addEventListener('touchstart', (e) => {
    if (e.target.id === 'btn-close-mascot') return;
    isMascotDragging = true;
    mStartX = e.touches[0].clientX;
    mStartY = e.touches[0].clientY;
    const rect = mascotWidget.getBoundingClientRect();
    mStartLeft = rect.left;
    mStartTop = rect.top;
  }, { passive: true });
  window.addEventListener('touchmove', (e) => {
    if (!isMascotDragging) return;
    const dx = e.touches[0].clientX - mStartX;
    const dy = e.touches[0].clientY - mStartY;
    mascotWidget.style.left = (mStartLeft + dx) + 'px';
    mascotWidget.style.top = (mStartTop + dy) + 'px';
    mascotWidget.style.right = 'auto';
  }, { passive: true });
  window.addEventListener('touchend', () => {
    isMascotDragging = false;
  });
}

`;

content = content.slice(0, sIdx) + cleanAdminJs + content.slice(eIdx);

fs.writeFileSync("index.html", content);
console.log("Successfully refactored admin tabs with support ticket functions!");
