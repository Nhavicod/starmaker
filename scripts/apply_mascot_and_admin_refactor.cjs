const fs = require("fs");

let html = fs.readFileSync("index.html", "utf8");

// 1. UPDATE HEADER BUTTONS: Add "🦁 Calibrar Mascota" alongside "👑 Panel Admin"
const oldHeaderRegex = /<header>[\s\S]*?<\/header>/;
const newHeader = `<header>
    <div class="brand-container">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--coral)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
      <span class="brand">STARMAKER</span>
    </div>
    <div style="display:flex;align-items:center;gap:10px;">
      <button class="admin-btn-top" id="btn-open-mascot" onclick="toggleMascotWidget()" style="display:inline-flex;align-items:center;gap:6px;background:rgba(241,141,121,0.14);border-color:rgba(241,141,121,0.35);color:#F18D79;">
        <span>🦁</span> Calibrar Mascota
      </button>
      <button class="admin-btn-top" id="btn-open-admin" onclick="openExecutiveAdmin()" style="display:inline-flex;align-items:center;gap:6px;">
        <i data-lucide="crown" style="width:13px;height:13px;color:#D4AF7A"></i> Panel Admin
      </button>
    </div>
  </header>`;

html = html.replace(oldHeaderRegex, newHeader);

// 2. INSERT FLOATING MASCOT WIDGET RIGHT BEFORE #adminExecutiveOverlay
const mascotWidgetHtml = `
  <!-- ================================================================ -->
  <!-- WIDGET FLOTANTE: EDICIÓN Y SUBIDA DE MASCOTA 3D                   -->
  <!-- ================================================================ -->
  <div class="admin-widget" id="mascot-widget" style="display:none;">
    <div class="admin-widget-header" id="mascot-widget-header">
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="font-size:16px;">🦁</span>
        <h3 style="font-size:13px;font-weight:800;letter-spacing:0.8px;margin:0;color:#fff;">CALIBRADOR DE MASCOTA</h3>
      </div>
      <button id="btn-close-mascot" onclick="closeMascotWidget()" style="background:transparent;border:none;color:#b9b0ba;font-size:18px;cursor:pointer;padding:2px 8px;border-radius:6px;transition:0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#b9b0ba'">✕</button>
    </div>
    <div class="admin-widget-content" style="padding:16px;max-height:calc(85vh - 55px);overflow-y:auto;">
      <div id="admin-error-msg" style="display:none;background:rgba(235,82,121,0.2);border:1px solid #EB5279;padding:10px;border-radius:8px;color:#EB5279;font-size:11px;margin-bottom:12px;font-weight:bold;"></div>
      <p style="font-size:11px;color:#b9b0ba;margin-bottom:14px;line-height:1.4;">Sube los videos de StarLeo (alfa transparente) y calibra tamaño y posición en tiempo real sobre el escenario 3D.</p>
      <div id="admin-portals-config"></div>
    </div>
  </div>
`;

if (!html.includes('id="mascot-widget"')) {
  html = html.replace('<div id="adminExecutiveOverlay"', mascotWidgetHtml + '\n  <div id="adminExecutiveOverlay"');
}

// 3. STREAMLINE TABS INSIDE #adminExecutiveOverlay
// Replace the 6 tabs with 5 purposeful tabs
const oldTabsHtml = `<nav class="admin-tabs" id="adminTabs">
      <button class="admin-tab active" data-tab="overview">Overview Ejecutivo</button>
      <button class="admin-tab" data-tab="requests">Solicitudes</button>
      <button class="admin-tab" data-tab="verification">Verificación</button>
      <button class="admin-tab" data-tab="support">Concierge & Soporte</button>
      <button class="admin-tab" data-tab="activity">Auditoría</button>
      <button class="admin-tab" data-tab="settings">Configuración Master</button>
    </nav>`;

const newTabsHtml = `<nav class="admin-tabs" id="adminTabs">
      <button class="admin-tab active" data-tab="overview"><i data-lucide="layout-dashboard" width="14" style="margin-right:6px"></i> Overview</button>
      <button class="admin-tab" data-tab="requests"><i data-lucide="inbox" width="14" style="margin-right:6px"></i> Solicitudes de Streamers</button>
      <button class="admin-tab" data-tab="tutorials"><i data-lucide="graduation-cap" width="14" style="margin-right:6px"></i> Academia & Tutoriales</button>
      <button class="admin-tab" data-tab="support"><i data-lucide="headphones" width="14" style="margin-right:6px"></i> Soporte & WhatsApp</button>
      <button class="admin-tab" data-tab="settings"><i data-lucide="settings" width="14" style="margin-right:6px"></i> Configuración</button>
    </nav>`;

html = html.replace(oldTabsHtml, newTabsHtml);

// Update bottom nav
const oldBottomNav = `<nav class="bottom-nav" id="adminBottom">
    <button data-tab="overview" class="active"><i data-lucide="layout-dashboard" width="18"></i>Overview</button>
    <button data-tab="requests"><i data-lucide="inbox" width="18"></i>Solicitudes</button>
    <button data-tab="verification"><i data-lucide="video" width="18"></i>Videos</button>
    <button data-tab="settings"><i data-lucide="sliders" width="18"></i>Master</button>
  </nav>`;

const newBottomNav = `<nav class="bottom-nav" id="adminBottom">
    <button data-tab="overview" class="active"><i data-lucide="layout-dashboard" width="18"></i>Overview</button>
    <button data-tab="requests"><i data-lucide="inbox" width="18"></i>Solicitudes</button>
    <button data-tab="tutorials"><i data-lucide="graduation-cap" width="18"></i>Academia</button>
    <button data-tab="support"><i data-lucide="headphones" width="18"></i>Soporte</button>
    <button data-tab="settings"><i data-lucide="settings" width="18"></i>Ajustes</button>
  </nav>`;

html = html.replace(oldBottomNav, newBottomNav);

// Add "Calibrar Mascota" button to the Executive Header
const oldAdminHeaderRight = `<button class="btn btn-secondary mini" onclick="openPublicPreview()" title="Ver cómo lucen las tarjetas públicas"><i data-lucide="eye" width="14"></i> Vista Previa</button>`;
const newAdminHeaderRight = `<button class="btn btn-secondary mini" onclick="closeExecutiveAdmin();toggleMascotWidget()" style="background:rgba(241,141,121,0.12);border-color:rgba(241,141,121,0.3);color:#F18D79;" title="Abrir Calibrador Flotante de Mascota">🦁 Calibrar Mascota</button>`;
html = html.replace(oldAdminHeaderRight, newAdminHeaderRight);

// Remove unused modals: extraMascotModal & publicPreviewModal
const extraModalRegex = /<!-- Modal Calibrador de Mascota Adicional -->[\s\S]*?<!-- Modal Vista Previa Pública -->[\s\S]*?<\/div>\s*<\/div>/;
html = html.replace(extraModalRegex, "");

console.log("DOM and HTML updated successfully.");
fs.writeFileSync("index.html", html);
