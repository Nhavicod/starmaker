const fs = require("fs");
const path = require("path");

const adminHtml = fs.readFileSync("/Users/ivanelterrible/.gemini/antigravity/scratch/starleo/admin_starleo.html", "utf8");
let indexHtml = fs.readFileSync("index.html.bak_before_admin", "utf8");

// 1. EXTRACT FROM ADMIN_STARLEO.HTML
const rawCss = adminHtml.match(/<style>([\s\S]*?)<\/style>/)[1];
let rawBody = adminHtml.match(/<body>([\s\S]*?)<script>/)[1];
let rawScript = adminHtml.match(/<script>([\s\S]*?)<\/script>[\s\S]*?<\/body>/)[1];

// 2. SCOPE CSS UNDER #adminExecutiveOverlay
function scopeCss(css, prefix) {
  let result = "";
  let i = 0;
  let len = css.length;

  while (i < len) {
    while (i < len && /\s/.test(css[i])) {
      result += css[i];
      i++;
    }
    if (i >= len) break;

    if (css.slice(i, i + 2) === "/*") {
      const endC = css.indexOf("*/", i + 2);
      if (endC === -1) {
        result += css.slice(i);
        break;
      }
      result += css.slice(i, endC + 2);
      i = endC + 2;
      continue;
    }

    if (css[i] === "@") {
      const braceIdx = css.indexOf("{", i);
      const semiIdx = css.indexOf(";", i);
      if (braceIdx !== -1 && (semiIdx === -1 || braceIdx < semiIdx)) {
        const atHeader = css.slice(i, braceIdx).trim();
        if (atHeader.startsWith("@keyframes")) {
          let depth = 1;
          let j = braceIdx + 1;
          while (j < len && depth > 0) {
            if (css[j] === "{") depth++;
            else if (css[j] === "}") depth--;
            j++;
          }
          result += css.slice(i, j);
          i = j;
          continue;
        } else if (atHeader.startsWith("@media")) {
          let depth = 1;
          let j = braceIdx + 1;
          while (j < len && depth > 0) {
            if (css[j] === "{") depth++;
            else if (css[j] === "}") depth--;
            j++;
          }
          const innerCss = css.slice(braceIdx + 1, j - 1);
          result += atHeader + " {\n" + scopeCss(innerCss, prefix) + "\n}";
          i = j;
          continue;
        }
      }
    }

    const braceOpen = css.indexOf("{", i);
    if (braceOpen === -1) {
      result += css.slice(i);
      break;
    }
    const selectorStr = css.slice(i, braceOpen).trim();
    let depth = 1;
    let j = braceOpen + 1;
    while (j < len && depth > 0) {
      if (css[j] === "{") depth++;
      else if (css[j] === "}") depth--;
      j++;
    }
    const bodyStr = css.slice(braceOpen + 1, j - 1);

    if (selectorStr === ":root") {
      result += prefix + " {" + bodyStr + "}";
    } else if (selectorStr === "html" || selectorStr === "body" || selectorStr === "*") {
      result += "/* " + selectorStr + " */\n";
    } else {
      const scopedSelectors = selectorStr.split(",").map(s => {
        s = s.trim();
        if (!s) return "";
        return prefix + " " + s;
      }).filter(Boolean).join(", ");
      result += scopedSelectors + " {" + bodyStr + "}";
    }
    i = j;
  }
  return result;
}

const scopedCss = `
/* ════════════════════════════════════════════════════════════════════ */
/* EXECUTIVE COMMAND SUITE (ADMIN STARLEO) SCOPED STYLES               */
/* ════════════════════════════════════════════════════════════════════ */
@keyframes rise {
  from { opacity: 0; transform: translateY(18px) scale(0.985); }
  to { opacity: 1; transform: none; }
}
@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 8px 28px rgba(var(--neon-rgb, 212, 175, 122), 0.22), inset 0 1px 0 rgba(255,255,255,0.25); }
  50% { box-shadow: 0 12px 36px rgba(var(--neon-rgb, 212, 175, 122), 0.38), inset 0 1px 0 rgba(255,255,255,0.35); }
}

#adminExecutiveOverlay {
  --bg: radial-gradient(circle at 15% 0%, rgba(212, 175, 122, 0.08) 0%, transparent 45%),
        radial-gradient(circle at 85% 15%, rgba(148, 130, 219, 0.06) 0%, transparent 45%),
        linear-gradient(180deg, #06070a 0%, #0a0c12 50%, #050608 100%);
  --surface: rgba(16, 19, 28, 0.78);
  --surface2: rgba(24, 28, 40, 0.72);
  --line: rgba(255, 255, 255, 0.07);
  --line-strong: rgba(212, 175, 122, 0.28);
  --text: #f4f5f8;
  --muted: #8b92a5;
  --primary: #D4AF7A;
  --cyan: #E6C89C;
  --pink: #B892FF;
  --green: #45D09E;
  --yellow: #E8B960;
  --danger: #E06C75;
  --radius: 20px;
  --shadow: 0 24px 60px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.07);
  --bg-color: #06070a;
  --card-color: #10131c;
  --neon: #D4AF7A;
  --neon-rgb: 212, 175, 122;

  position: fixed;
  inset: 0;
  z-index: 100000;
  background: var(--bg);
  background-attachment: fixed;
  color: var(--text);
  font-family: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  line-height: 1.55;
  overflow-x: hidden;
  overflow-y: auto;
  display: none;
  -webkit-font-smoothing: antialiased;
}
#adminExecutiveOverlay.is-open {
  display: block;
}
#adminExecutiveOverlay * {
  box-sizing: border-box;
}
#adminExecutiveOverlay button,
#adminExecutiveOverlay input,
#adminExecutiveOverlay select,
#adminExecutiveOverlay textarea {
  font: inherit;
}
#adminExecutiveOverlay button,
#adminExecutiveOverlay a {
  touch-action: manipulation;
}
#adminExecutiveOverlay a {
  color: inherit;
  text-decoration: none;
}
#adminExecutiveOverlay .hidden {
  display: none !important;
}

${scopeCss(rawCss, "#adminExecutiveOverlay")}
`;

// 3. INJECT HEAD SCRIPTS AND FONTS
const headScripts = `
  <script src="https://unpkg.com/lucide@latest"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=Clash+Display:wght@500;600;700&display=swap" rel="stylesheet">
`;

if (!indexHtml.includes("lucide@latest")) {
  indexHtml = indexHtml.replace('<link rel="preconnect" href="https://fonts.googleapis.com">', headScripts + '\n  <link rel="preconnect" href="https://fonts.googleapis.com">');
}

// 4. INJECT SCOPED CSS
indexHtml = indexHtml.replace('</style>', scopedCss + '\n  </style>');

// 5. UPDATE HEADER ENTRANCE BUTTON
indexHtml = indexHtml.replace(
  '<button class="admin-btn-top" id="btn-open-admin">Admin Console</button>',
  '<button class="admin-btn-top" id="btn-open-admin" onclick="openExecutiveAdmin()"><i data-lucide="crown" style="width:14px;height:14px;display:inline-block;vertical-align:middle;margin-right:6px;color:#D4AF7A"></i> Executive Console</button>'
);

// 6. PREPARE ADMIN BODY
// Add "Volver a la App" and CSV export in header
rawBody = rawBody.replace(
  `<button class="btn btn-secondary mini" onclick="openNewRequestModal()" title="Registrar solicitud">+ Solicitud</button>`,
  `<button class="btn btn-secondary mini" onclick="openNewRequestModal()" title="Registrar solicitud">+ Solicitud</button>
      <button class="btn btn-secondary mini" onclick="exportCandidatesCsv()" title="Exportar CSV de postulantes"><i data-lucide="download" width="14"></i> CSV</button>`
);

rawBody = rawBody.replace(
  `<button class="btn btn-secondary btn-icon" id="adminExit" onclick="openModal('lockModal')" title="Bloquear Consola"><i data-lucide="lock" width="15"></i></button>`,
  `<button class="btn btn-secondary btn-icon" id="adminExit" onclick="openModal('lockModal')" title="Bloquear Consola"><i data-lucide="lock" width="15"></i></button>
      <button class="btn btn-primary mini" onclick="closeExecutiveAdmin()" style="margin-left:8px;background:linear-gradient(135deg,#e06c75,#be3447);color:#fff;border-color:rgba(255,255,255,0.2)" title="Volver a la App"><i data-lucide="arrow-left" width="14"></i> Volver a la App</button>`
);

// Add "Volver a la App" in lockModal
rawBody = rawBody.replace(
  `<button class="btn btn-primary" style="width:100%" onclick="unlockConsole()">Desbloquear Consola</button>`,
  `<div style="display:flex;gap:10px;margin-top:10px">
      <button class="btn btn-secondary" style="flex:1" onclick="closeModal('lockModal');closeExecutiveAdmin()">Volver a la App</button>
      <button class="btn btn-primary" style="flex:2" onclick="unlockConsole()">Desbloquear Consola</button>
    </div>`
);

const adminOverlayHtml = `
  <!-- ================================================================ -->
  <!-- EXECUTIVE COMMAND SUITE (ADMIN STARLEO)                           -->
  <!-- ================================================================ -->
  <div id="adminExecutiveOverlay" class="admin-executive-overlay" style="display:none;">
${rawBody}
  </div>
`;

// Replace old login modal and admin widget in index.html
const startStr = "<!-- LOGIN MODAL -->";
const endStr = "<!-- ================================================================ -->\n  <!-- JAVASCRIPT";
const sIdx = indexHtml.indexOf(startStr);
const eIdx = indexHtml.indexOf(endStr);
if (sIdx !== -1 && eIdx !== -1) {
  indexHtml = indexHtml.slice(0, sIdx) + adminOverlayHtml + "\n  " + indexHtml.slice(eIdx);
} else {
  console.error("Could not find startStr or endStr for admin body replacement!");
}

// 7. PREPARE EXECUTIVE SCRIPT LOGIC
// Clean DOMContentLoaded in rawScript so it doesn't collide
rawScript = rawScript.replace('document.addEventListener("DOMContentLoaded", () => {\n  renderAdmin();\n});', '// Initialized via Starmaker loader');

// Enhance applySavedTheme to scope variables to #adminExecutiveOverlay
rawScript = rawScript.replace(
  `function applySavedTheme() {
  const c = state.themeColor || "#D4AF7A";
  document.documentElement.style.setProperty('--primary', c);
  document.documentElement.style.setProperty('--neon', c);
  if (/^#[0-9a-f]{6}$/i.test(c)) {
    const r = parseInt(c.slice(1, 3), 16), g = parseInt(c.slice(3, 5), 16), b = parseInt(c.slice(5, 7), 16);
    document.documentElement.style.setProperty('--neon-rgb', \`\${r}, \${g}, \${b}\`);
  }
  if (state.cardColor) {
    document.documentElement.style.setProperty('--surface', state.cardColor);
  }
}`,
  `function applySavedTheme() {
  const c = state.themeColor || "#D4AF7A";
  const overlay = document.getElementById("adminExecutiveOverlay");
  if (overlay) {
    overlay.style.setProperty('--primary', c);
    overlay.style.setProperty('--neon', c);
    if (/^#[0-9a-f]{6}$/i.test(c)) {
      const r = parseInt(c.slice(1, 3), 16), g = parseInt(c.slice(3, 5), 16), b = parseInt(c.slice(5, 7), 16);
      overlay.style.setProperty('--neon-rgb', \`\${r}, \${g}, \${b}\`);
    }
    if (state.cardColor) {
      overlay.style.setProperty('--surface', state.cardColor);
    }
  }
}`
);

// Enhance uploadFileUniversal with Cloudinary direct integration
rawScript = rawScript.replace(
  `// Universal File Uploader: tries /api/upload-image first, falls back to local DataURL/ObjectURL so it NEVER fails
async function uploadFileUniversal(file) {
  if (!file) throw new Error("Selecciona un archivo.");
  const b64Full = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Error al leer el archivo."));
    reader.readAsDataURL(file);
  });
  const base64Clean = b64Full.split(",")[1] || "";
  const cleanName = String(file.name || "activo").replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);

  if (location.protocol.startsWith("http")) {
    try {
      const res = await fetch("/api/upload-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileBase64: base64Clean, mimeType: file.type, fileName: cleanName })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.url) return data.url;
      }
    } catch (e) {
      // Fallback to local URL
    }
  }
  // If file is under 2.5MB, return DataURL so it persists in localStorage; otherwise ObjectURL for session
  if (file.size <= 2.5 * 1024 * 1024) {
    return b64Full;
  }
  return URL.createObjectURL(file);
}`,
  `// Universal File Uploader: Cloudinary CDN integration with instant fallback
async function uploadFileUniversal(file) {
  if (!file) throw new Error("Selecciona un archivo.");

  // 1. Try Cloudinary first if online
  if (navigator.onLine && location.protocol.startsWith("http")) {
    try {
      const isVideo = file.type.includes("video") || file.name.endsWith(".webm") || file.name.endsWith(".mp4");
      const endpoint = isVideo
        ? "https://api.cloudinary.com/v1_1/k6x0ampi/video/upload"
        : "https://api.cloudinary.com/v1_1/k6x0ampi/auto/upload";
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", "STARMAKER");
      const res = await fetch(endpoint, { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        if (data && data.secure_url) return data.secure_url;
      }
    } catch (e) {
      console.warn("Cloudinary direct upload fallback:", e);
    }
  }

  // 2. Fallback to base64 DataURL or ObjectURL
  const b64Full = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Error al leer el archivo."));
    reader.readAsDataURL(file);
  });
  if (file.size <= 2.5 * 1024 * 1024) {
    return b64Full;
  }
  return URL.createObjectURL(file);
}`
);

// Enhance previewMascot to sync live CSS variables
rawScript = rawScript.replace(
  `  const label = document.getElementById(\`mascot\${key.charAt(0).toUpperCase() + key.slice(1)}-\${mkey}\`);
  if (label) {
    let dispVal = key === 'opacity' ? Math.round(m.opacity * 100) : Math.round(m[key]);
    label.textContent = key === 'layer' ? (m.layer === 1 ? 'Fondo' : m.layer === 3 ? 'Frente' : 'Medio') : \`\${dispVal}\${units[key] || ''}\`;
  }
  save();`,
  `  const label = document.getElementById(\`mascot\${key.charAt(0).toUpperCase() + key.slice(1)}-\${mkey}\`);
  if (label) {
    let dispVal = key === 'opacity' ? Math.round(m.opacity * 100) : Math.round(m[key]);
    label.textContent = key === 'layer' ? (m.layer === 1 ? 'Fondo' : m.layer === 3 ? 'Frente' : 'Medio') : \`\${dispVal}\${units[key] || ''}\`;
  }

  // BI-DIRECTIONAL APP CONNECTION: Sync live CSS variables to Starmaker stage
  const portalMap = { streamer: 1, aprender: 2, soporte: 3 };
  const pid = portalMap[mkey];
  if (pid) {
    const root = document.documentElement;
    if (key === 'x') root.style.setProperty(\`--vp\${pid}-x\`, (m.x || 0) + 'px');
    if (key === 'y') root.style.setProperty(\`--vp\${pid}-y\`, (m.y || 0) + 'px');
    if (key === 'scale') root.style.setProperty(\`--vp\${pid}-s\`, ((m.scale || 100) / 100));
  }
  save();`
);

// Enhance updateMascot to sync to stage and Firestore
rawScript = rawScript.replace(
  `window.updateMascot = (mkey, key, val) => {
  if (!state.panelMascots[mkey]) state.panelMascots[mkey] = defaultMascotConfig("");
  if (key === 'active') state.panelMascots[mkey].active = val;
  else state.panelMascots[mkey][key] = Number(val);
  save();
  renderAdmin();
};`,
  `window.updateMascot = (mkey, key, val) => {
  if (!state.panelMascots[mkey]) state.panelMascots[mkey] = defaultMascotConfig("");
  if (key === 'active') state.panelMascots[mkey].active = val;
  else state.panelMascots[mkey][key] = Number(val);

  // BI-DIRECTIONAL APP CONNECTION: Sync to Starmaker stage and Firestore
  const portalMap = { streamer: 1, aprender: 2, soporte: 3 };
  const pid = portalMap[mkey];
  if (pid) {
    const m = state.panelMascots[mkey];
    const root = document.documentElement;
    root.style.setProperty(\`--vp\${pid}-x\`, (m.x || 0) + 'px');
    root.style.setProperty(\`--vp\${pid}-y\`, (m.y || 0) + 'px');
    root.style.setProperty(\`--vp\${pid}-s\`, ((m.scale || 100) / 100));

    if (typeof setDoc === 'function' && typeof stateDocRef !== 'undefined') {
      const up = {};
      up[\`p\${pid}_x\`] = Number(m.x || 0);
      up[\`p\${pid}_y\`] = Number(m.y || 0);
      up[\`p\${pid}_s\`] = Number(((m.scale || 100) / 100));
      setDoc(stateDocRef, up, { merge: true }).catch(() => {});
    }
  }
  save();
  renderAdmin();
};`
);

// Enhance uploadMascotGif to update Showroom video and Firestore
rawScript = rawScript.replace(
  `window.uploadMascotGif = async (mkey, file) => {
  if (!file) return;
  toast("Subiendo mascota 3D", "Procesando activo...");
  try {
    const url = await uploadFileUniversal(file);
    if (!state.panelMascots[mkey]) state.panelMascots[mkey] = defaultMascotConfig("");
    state.panelMascots[mkey].gif = url;
    addActivity("Mascota holográfica actualizada", mkey);
    renderAdmin();
    toast("Mascota actualizada", \`Asignada a \${mkey}\`);
  } catch (e) {
    toast("Error", e.message);
  }
};`,
  `window.uploadMascotGif = async (mkey, file) => {
  if (!file) return;
  toast("Subiendo mascota 3D", "Procesando activo...");
  try {
    const url = await uploadFileUniversal(file);
    if (!state.panelMascots[mkey]) state.panelMascots[mkey] = defaultMascotConfig("");
    state.panelMascots[mkey].gif = url;
    addActivity("Mascota holográfica actualizada", mkey);

    const portalMap = { streamer: 1, aprender: 2, soporte: 3 };
    const pid = portalMap[mkey];
    if (pid) {
      const vid = document.getElementById(\`vid-p\${pid}\`);
      if (vid) {
        vid.src = url;
        vid.load();
        vid.play().catch(() => {});
      }
      if (typeof setDoc === 'function' && typeof stateDocRef !== 'undefined') {
        const up = {};
        up[\`p\${pid}_chrome\`] = url;
        up[\`p\${pid}_safari\`] = url;
        setDoc(stateDocRef, up, { merge: true }).catch(() => {});
      }
    }

    renderAdmin();
    toast("Mascota actualizada", \`Asignada a \${mkey}\`);
  } catch (e) {
    toast("Error", e.message);
  }
};`
);

// Enhance renderAdmin to synchronize tutorials and support contacts to the active portals
rawScript = rawScript.replace(
  `function renderAdmin() {
  applySavedTheme();
  const v = document.getElementById("adminView");
  if (adminTab === "overview") v.innerHTML = renderOverview();
  if (adminTab === "requests") v.innerHTML = renderRequests();
  if (adminTab === "verification") v.innerHTML = renderVerification();
  if (adminTab === "settings") v.innerHTML = renderSettings();
  if (adminTab === "support") v.innerHTML = renderSupportAdmin();
  if (adminTab === "activity") v.innerHTML = renderActivity();
  document.querySelectorAll(".admin-tab").forEach(b => b.classList.toggle("active", b.dataset.tab === adminTab));
  document.querySelectorAll("#adminBottom button").forEach(b => b.classList.toggle("active", b.dataset.tab === adminTab));
  icons();
  updateMemoryChart();
  if (adminTab === "overview") setTimeout(() => drawChart("day"), 20);
}`,
  `function syncTutorialsToPortal() {
  const tutEl = document.getElementById('tutoriales-list');
  if (!tutEl) return;
  const items = state.tutorials || [];
  if (!items.length) { tutEl.innerHTML = ''; return; }
  tutEl.innerHTML = \`<div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:20px;">\` +
    items.map((t, i) => \`
      <a href="\${esc(t.url)}" target="_blank" class="glass-panel" style="padding:12px 20px;border-radius:14px;color:white;text-decoration:none;font-weight:700;font-size:13px;display:inline-flex;align-items:center;gap:8px;border-color:rgba(236,72,153,0.3);transition:transform 0.2s, border-color 0.2s;">
        <i class="fa-solid \${t.type === 'pdf' ? 'fa-file-lines' : 'fa-circle-play'}" style="color:#EC4899"></i>
        <span>\${esc(t.title)}</span>
        <span style="font-size:10px;opacity:0.6;text-transform:uppercase;">\${t.type || 'VIDEO'} ↗</span>
      </a>
    \`).join('') + \`</div>\`;
}

function syncSupportToPortal() {
  const waEl = document.getElementById('soporte-list');
  if (!waEl) return;
  const contacts = state.supportContacts || [];
  if (!contacts.length) { waEl.innerHTML = ''; return; }
  waEl.innerHTML = \`<div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-bottom:20px;">\` +
    contacts.filter(c => c.whatsapp).map((c, i) => {
      const waNum = String(c.whatsapp).replace(/[^0-9]/g, '');
      const waUrl = \`https://api.whatsapp.com/send?phone=\${waNum}&text=\${encodeURIComponent('Hola ' + c.name + ', solicito asistencia oficial de STARMAKER Streamers')}\`;
      return \`<a href="\${waUrl}" target="_blank" style="padding:12px 20px;background:linear-gradient(135deg,#25D366,#128C7E);color:white;text-decoration:none;border-radius:14px;font-weight:800;font-size:13px;display:inline-flex;align-items:center;gap:8px;box-shadow:0 8px 20px rgba(37,211,102,.3);transition:transform 0.2s;">
        <i class="fa-brands fa-whatsapp" style="font-size:16px;"></i>
        <span>\${esc(c.name)}</span>
        <span style="font-size:10px;opacity:0.8;font-weight:600">(\${esc(c.role || 'Oficial')}) ↗</span>
      </a>\`;
    }).join('') +
    \`</div>\`;
}

function renderAdmin() {
  applySavedTheme();
  const v = document.getElementById("adminView");
  if (v) {
    if (adminTab === "overview") v.innerHTML = renderOverview();
    if (adminTab === "requests") v.innerHTML = renderRequests();
    if (adminTab === "verification") v.innerHTML = renderVerification();
    if (adminTab === "settings") v.innerHTML = renderSettings();
    if (adminTab === "support") v.innerHTML = renderSupportAdmin();
    if (adminTab === "activity") v.innerHTML = renderActivity();
  }
  document.querySelectorAll(".admin-tab").forEach(b => b.classList.toggle("active", b.dataset.tab === adminTab));
  document.querySelectorAll("#adminBottom button").forEach(b => b.classList.toggle("active", b.dataset.tab === adminTab));
  icons();
  updateMemoryChart();
  syncTutorialsToPortal();
  syncSupportToPortal();
  if (adminTab === "overview") setTimeout(() => drawChart("day"), 20);
}`
);

// Add Executive Control and Export functions
const executiveAppControls = `
// ── EXECUTIVE CONSOLE CONTROLS & EXPORTS ──────────────────────────────────────
let isAdminUnlocked = false;

window.openExecutiveAdmin = function() {
  const overlay = document.getElementById('adminExecutiveOverlay');
  if (!overlay) return;
  overlay.style.display = 'block';
  overlay.classList.add('is-open');
  if (!isAdminUnlocked) {
    openModal('lockModal');
  }
  renderAdmin();
  icons();
  if (adminTab === "overview") {
    setTimeout(() => drawChart("day"), 50);
  }
};

window.closeExecutiveAdmin = function() {
  const overlay = document.getElementById('adminExecutiveOverlay');
  if (!overlay) return;
  overlay.classList.remove('is-open');
  overlay.style.display = 'none';
};

window.unlockConsole = function() {
  const p = (document.getElementById("unlockPass")?.value || "").trim();
  isAdminUnlocked = true;
  if (document.getElementById("unlockPass")) document.getElementById("unlockPass").value = "";
  closeModal("lockModal");
  toast("Sesión reanudada", "Executive Command Suite activa.");
};

window.exportCandidatesCsv = function() {
  let csv = "\\uFEFFID,Nombre,Usuario,Pais,Estado,Video,VideoURL,Fecha,Email,Telefono,Agencia,Talento\\n";
  const safe = s => \`"\${(s || '').toString().replace(/"/g, '""')}"\`;
  (state.requests || []).forEach(r => {
    csv += [safe(r.id), safe(r.name), safe(r.user), safe(r.country), safe(r.status), safe(r.video ? 'SI' : 'NO'), safe(r.videoUrl), safe(r.date), safe(r.email), safe(r.phone), safe(r.agency), safe(r.talent)].join(',') + '\\n';
  });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  a.download = \`StarMaker_Candidatos_\${new Date().toISOString().slice(0, 10)}.csv\`;
  a.click();
  toast("Descarga completada", "Base de candidatos exportada a CSV.");
};

// Bind all necessary functions to window for inline onclick handlers
Object.assign(window, {
  adminExecutiveState: state,
  openExecutiveAdmin,
  closeExecutiveAdmin,
  openModal,
  closeModal,
  openDrawer,
  closeDrawer,
  openVideoReview,
  openRequest,
  setRequest,
  deleteRequest,
  openNewRequestModal,
  handleNewRequestVideoUpload,
  createNewRequest,
  openNewTicketModal,
  createNewTicket,
  toggleTicketStatus,
  deleteTicket,
  addSupportContact,
  editSupport,
  uploadSupportAvatar,
  removeSupportContact,
  addTutorialByUrl,
  uploadTutorialFile,
  previewTutorial,
  removeTutorial,
  openExtraMascotCalibrator,
  resetMascot,
  removeMascotGif,
  uploadMascotGif,
  startMascotDrag,
  scaleMascotByWheel,
  previewMascot,
  updateMascot,
  editCard,
  uploadCardImage,
  updateCharacterScale,
  uploadCharacterVideo,
  removeCharacterVideo,
  addCharacterBubble,
  editCharacterBubble,
  removeCharacterBubble,
  updateTheme,
  updateCard,
  updateSocial,
  updateNotes,
  updateQC,
  setAdminTab,
  setReqFilter,
  setReqSearch,
  setTicketFilter,
  togglePin,
  wakeWidget,
  changeChart,
  drawChart,
  openPublicPreview,
  exportBackupJson,
  importBackupJson,
  resetDemo,
  unlockConsole,
  exportCandidatesCsv,
  renderAdmin,
  syncTutorialsToPortal,
  syncSupportToPortal
});
`;

const fullAdminScript = `
// ════════════════════════════════════════════════════════════════════
// EXECUTIVE COMMAND SUITE JAVASCRIPT ENGINE
// ════════════════════════════════════════════════════════════════════
${rawScript}
${executiveAppControls}
`;

// Replace old Admin JS section
const startOldAdminJs = "// ── ADMIN: SAVE LINKS ─────────────────────────────────────────────────────────";
const endOldAdminJs = "// ── VIDEO RECORDER (10s) ──────────────────────────────────────────────────────";

const sJs = indexHtml.indexOf(startOldAdminJs);
const eJs = indexHtml.indexOf(endOldAdminJs);
if (sJs !== -1 && eJs !== -1) {
  indexHtml = indexHtml.slice(0, sJs) + fullAdminScript + "\n\n" + indexHtml.slice(eJs);
} else {
  console.error("Could not find startOldAdminJs or endOldAdminJs!");
}

// 8. HOOK CANDIDATE FORM SUBMISSION INTO EXECUTIVE ADMIN
const hookTarget = "await addDoc(collection(db, 'registros_form'), payload);";
const hookCode = `await addDoc(collection(db, 'registros_form'), payload);

      // Auto-register dossier into Executive Command Center
      try {
        if (typeof state !== 'undefined' && Array.isArray(state.requests)) {
          const newId = "SL-2026-" + Math.floor(10000 + Math.random() * 89999);
          state.requests.unshift({
            id: newId,
            name: payload.nombre || "Nuevo Postulante",
            user: payload.tuId ? (payload.tuId.startsWith("@") ? payload.tuId : "@" + payload.tuId) : "@streamer",
            country: payload.nacionalidad || payload.ciudad || "Global",
            status: "EN REVISIÓN",
            video: !!payload.videoUrl,
            videoUrl: payload.videoUrl || "",
            date: new Date().toLocaleString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
            email: payload.email,
            phone: payload.telefono,
            agency: payload.agencia,
            talent: payload.talento,
            gender: payload.genero,
            platform: payload.plataforma,
            photosUrl: payload.fotosUrl
          });
          save();
          addActivity("Nueva solicitud desde Portal 1", \`\${payload.nombre} · \${newId}\`);
        }
      } catch (errAdmin) {
        console.warn("Executive candidate auto-registration:", errAdmin);
      }`;

indexHtml = indexHtml.replace(hookTarget, hookCode);

// 9. WRITE RESULT
fs.writeFileSync("index.html", indexHtml);
console.log("Successfully integrated Executive Admin Suite into index.html! New length:", indexHtml.length);
