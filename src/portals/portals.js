import {
  state,
  esc,
  toast,
  uploadFileUniversal,
  submitRegistrationEverywhere,
  submitTicketEverywhere
} from "../services/bridge.js";
import { volverAlShowroom } from "../showroom/stage.js";

// ==========================================================================
// PORTAL 1: CANDIDATE REGISTRATION + 10S CAMERA RECORDER + FILE UPLOAD
// ==========================================================================
export function initRegistrationPortal() {
  const btnRecord = document.getElementById("btn-record-video");
  const fileVideoInput = document.getElementById("reg-video-file");
  const recordPrev = document.getElementById("record-preview");
  const recordStatus = document.getElementById("record-status");
  const regVideoUrl = document.getElementById("reg-video-url");
  const regForm = document.getElementById("native-registration-form");

  // Option A: Live 10-second camera capture
  if (btnRecord) {
    btnRecord.onclick = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 480 }, height: { ideal: 640 }, frameRate: { ideal: 15 } },
          audio: true
        });
        recordPrev.srcObject = stream;
        recordPrev.style.display = "block";
        recordPrev.muted = true;
        recordPrev.play().catch(() => {});

        const opts = { videoBitsPerSecond: 250000 };
        if (window.MediaRecorder?.isTypeSupported("video/webm;codecs=vp9")) opts.mimeType = "video/webm;codecs=vp9";
        else if (window.MediaRecorder?.isTypeSupported("video/webm")) opts.mimeType = "video/webm";
        else if (window.MediaRecorder?.isTypeSupported("video/mp4")) opts.mimeType = "video/mp4";

        const recorder = new MediaRecorder(stream, opts);
        const chunks = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        let secondsLeft = 10;
        btnRecord.disabled = true;
        btnRecord.innerHTML = `<i class="fa-solid fa-circle" style="color:#ef4444"></i> Grabando (${secondsLeft}s)`;
        const timer = setInterval(() => {
          secondsLeft--;
          if (secondsLeft > 0) {
            btnRecord.innerHTML = `<i class="fa-solid fa-circle" style="color:#ef4444"></i> Grabando (${secondsLeft}s)`;
          }
        }, 1000);

        recorder.onstop = async () => {
          clearInterval(timer);
          stream.getTracks().forEach((t) => t.stop());
          recordPrev.srcObject = null;
          recordPrev.style.display = "none";
          recordStatus.textContent = "⏳ Procesando y subiendo video...";

          const mime = recorder.mimeType || "video/webm";
          const ext = mime.includes("mp4") ? "mp4" : "webm";
          const file = new File([new Blob(chunks, { type: mime })], `verificacion_${Date.now()}.${ext}`, {
            type: mime
          });

          try {
            const url = await uploadFileUniversal(file);
            regVideoUrl.value = url;
            recordStatus.textContent = "✅ Video de verificación listo.";
            btnRecord.disabled = false;
            btnRecord.innerHTML = `<i class="fa-solid fa-rotate-right"></i> Regrabar (10s)`;
          } catch (err) {
            recordStatus.textContent = "❌ Error al subir video. Puedes intentar de nuevo o usar 'Archivo'.";
            btnRecord.disabled = false;
            btnRecord.innerHTML = `<i class="fa-solid fa-camera"></i> Grabar (10s)`;
          }
        };

        recorder.start();
        setTimeout(() => {
          if (recorder.state === "recording") recorder.stop();
        }, 10000);
      } catch (err) {
        recordStatus.textContent = "⚠️ Cámara no disponible. Usa el botón 'Archivo' para subir tu video.";
      }
    };
  }

  // Option B: Upload pre-recorded video clip
  if (fileVideoInput) {
    fileVideoInput.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 80 * 1024 * 1024) {
        recordStatus.textContent = "⚠️ El video debe pesar menos de 80 MB.";
        return;
      }
      recordStatus.textContent = "⏳ Subiendo archivo de video...";
      try {
        const url = await uploadFileUniversal(file);
        regVideoUrl.value = url;
        recordStatus.textContent = `✅ Video cargado: ${file.name}`;
      } catch (err) {
        recordStatus.textContent = "❌ Error al cargar el archivo: " + err.message;
      }
    };
  }

  // Form Submission
  if (regForm) {
    regForm.onsubmit = async (e) => {
      e.preventDefault();

      const btn = document.getElementById("btn-submit-reg");
      const feedback = document.getElementById("reg-feedback");
      const status = document.getElementById("reg-upload-status");
      const videoUrl = regVideoUrl.value;
      const fileInput = document.getElementById("reg-id-photos");

      if (!fileInput.files || fileInput.files.length === 0) {
        status.textContent = "⚠️ Sube al menos una foto de tu identificación oficial.";
        fileInput.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      if (!videoUrl) {
        recordStatus.textContent = "⚠️ Graba o sube tu video de verificación de 10s antes de enviar.";
        btnRecord?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      btn.disabled = true;
      btn.innerHTML = `<span>PROCESANDO EXPEDIENTE...</span>`;
      feedback.style.display = "none";
      status.textContent = "";

      try {
        const files = Array.from(fileInput.files).slice(0, 5);
        const photoUrls = [];

        for (let i = 0; i < files.length; i++) {
          if (files[i].size > 50 * 1024 * 1024) throw new Error(`La foto ${i + 1} supera 50 MB`);
          status.textContent = `Subiendo identificación (${i + 1}/${files.length})...`;
          const url = await uploadFileUniversal(files[i]);
          photoUrls.push(url);
        }

        status.textContent = "Sincronizando con Consola Ejecutiva...";

        const payload = {
          nombre: document.getElementById("reg-name").value.trim(),
          email: document.getElementById("reg-email").value.trim(),
          telefono: document.getElementById("reg-phone").value.trim(),
          agencia: document.getElementById("reg-agency").value.trim(),
          tuId: document.getElementById("reg-id").value.trim(),
          agentId: document.getElementById("reg-agent-id").value.trim(),
          nacionalidad: document.getElementById("reg-nationality").value.trim(),
          ciudad: document.getElementById("reg-city").value.trim(),
          talento: document.getElementById("reg-talent").value.trim(),
          genero: document.getElementById("reg-gender").value,
          plataforma: document.getElementById("reg-platform").value.trim(),
          videoUrl,
          fotosUrl: photoUrls.join(" | "),
          createdAt: new Date().toISOString()
        };

        await submitRegistrationEverywhere(payload);

        status.textContent = "";
        feedback.textContent = "¡✅ POSTULACIÓN ENVIADA CON ÉXITO! Tu expediente ya está en revisión oficial.";
        feedback.style.display = "block";
        toast("Postulación registrada", `${payload.nombre} ingresó a bandeja ejecutiva.`);

        regForm.reset();
        regVideoUrl.value = "";
        recordStatus.textContent = "";
        if (btnRecord) {
          btnRecord.disabled = false;
          btnRecord.innerHTML = `<i class="fa-solid fa-camera"></i> Grabar (10s)`;
        }

        setTimeout(() => {
          volverAlShowroom();
          setTimeout(() => {
            feedback.style.display = "none";
            btn.disabled = false;
            btn.innerHTML = `<span>SOLICITAR ACCESO VIP</span> <i class="fa-solid fa-arrow-right"></i>`;
          }, 450);
        }, 3200);
      } catch (err) {
        status.textContent = "❌ Error: " + err.message;
        btn.disabled = false;
        btn.innerHTML = `<span>SOLICITAR ACCESO VIP</span> <i class="fa-solid fa-arrow-right"></i>`;
      }
    };
  }
}

// ==========================================================================
// PORTAL 2: ACADEMIA STARMAKER (CONNECTED LIVE WITH ADMIN TUTORIALS)
// ==========================================================================
const DEFAULT_THUMBS = [
  "https://images.unsplash.com/photo-1516280440502-a2f0729792bf?w=600&q=80",
  "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&q=80",
  "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&q=80"
];

function extractYouTubeEmbedUrl(url) {
  if (!url) return null;
  const regExp = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
  const match = url.match(regExp);
  return match ? `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=1&rel=0` : null;
}

export function syncTutorialsToPortal() {
  const container = document.getElementById("tutoriales-catalog");
  if (!container) return;

  const items = Array.isArray(state.tutorials) ? state.tutorials : [];
  if (!items.length) {
    container.innerHTML = `<div class="glass-panel" style="padding:36px;text-align:center;color:#9ca3af;">Aún no hay recursos publicados en la Academia.</div>`;
    return;
  }

  // Group tutorials by category preserving clean row order
  const groups = new Map();
  items.forEach((item, index) => {
    const cat = item.category || "Recursos Destacados";
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat).push({ item, index });
  });

  const accentPalette = ["#EC4899", "#F59E0B", "#8B5CF6", "#10B981"];
  let groupIdx = 0;
  let html = "";

  for (const [catName, entries] of groups.entries()) {
    const accent = accentPalette[groupIdx % accentPalette.length];
    groupIdx++;

    const cardsHtml = entries
      .map(({ item, index }, localIdx) => {
        const thumb = item.thumb || DEFAULT_THUMBS[(index + localIdx) % DEFAULT_THUMBS.length];
        const isPdf = item.type === "pdf" || /\.pdf($|\?)/i.test(item.url || "");
        const duration = item.duration || (isPdf ? "PDF" : item.url ? "VIDEO" : "GUÍA");
        const progress = Number.isFinite(Number(item.progress)) ? Number(item.progress) : 100;
        const iconClass = isPdf ? "fa-file-pdf" : "fa-play";

        return `
        <div class="glass-panel scroll-item" onclick="abrirRecursoAcademia(${index})">
          <div style="height:158px;position:relative;overflow:hidden;background:#0a0812;">
            <img src="${esc(thumb)}" alt="${esc(item.title)}" class="tut-thumbnail" loading="lazy" style="width:100%;height:100%;object-fit:cover;transition:transform 0.5s ease;" />
            <div class="tut-play-overlay">
              <div class="tut-play-btn" style="background:${accent};box-shadow:0 0 24px ${accent};color:${accent === '#F59E0B' ? '#000' : '#fff'};">
                <i class="fa-solid ${iconClass}"></i>
              </div>
            </div>
            ${
              item.badge
                ? `<div style="position:absolute;top:10px;left:10px;background:${accent};color:${accent === '#F59E0B' ? '#000' : '#fff'};padding:3px 8px;border-radius:6px;font-size:9px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;">${esc(item.badge)}</div>`
                : ""
            }
            <div style="position:absolute;bottom:10px;right:10px;background:rgba(0,0,0,0.85);backdrop-filter:blur(4px);padding:3px 8px;border-radius:6px;font-size:10px;color:#fff;font-weight:800;">${esc(duration)}</div>
          </div>
          <div style="padding:16px;background:rgba(18,14,26,0.75);display:flex;flex-direction:column;justify-content:space-between;min-height:118px;">
            <div>
              <h4 style="color:#fff;font-weight:800;font-size:14px;margin:0 0 6px;line-height:1.25;">${esc(item.title)}</h4>
              <p style="color:#9ca3af;font-size:11.5px;margin:0 0 14px;line-height:1.45;">${esc(item.desc || "Recurso oficial Academia StarMaker")}</p>
            </div>
            <div style="width:100%;height:4px;background:rgba(255,255,255,0.08);border-radius:99px;overflow:hidden;">
              <div style="width:${Math.max(12, Math.min(100, progress))}%;height:100%;background:${accent};"></div>
            </div>
          </div>
        </div>`;
      })
      .join("");

    html += `
      <div style="margin-bottom:34px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;padding:0 8px;">
          <h3 style="font-size:18px;font-weight:800;color:#fff;display:flex;align-items:center;gap:12px;">
            <span style="display:inline-block;width:4px;height:20px;background:${accent};border-radius:2px;box-shadow:0 0 12px ${accent};"></span>
            ${esc(catName)}
          </h3>
          <span style="font-size:11px;color:#8f8998;font-weight:600;"><i class="fa-solid fa-arrows-left-right"></i> Desliza para explorar</span>
        </div>
        <div class="scroll-row hide-scroll">${cardsHtml}</div>
      </div>`;
  }

  container.innerHTML = html;
}

export function abrirRecursoAcademia(index) {
  const item = state.tutorials?.[index];
  if (!item) return;

  const modal = document.getElementById("video-preview-modal");
  const kickerEl = document.getElementById("modal-video-kicker");
  const titleEl = document.getElementById("modal-video-title");
  const bodyEl = document.getElementById("modal-video-body");
  if (!modal || !bodyEl) return;

  kickerEl.textContent = `${item.category || "Academia StarMaker"}${item.duration ? " · " + item.duration : ""}`;
  titleEl.textContent = item.title;

  const url = (item.url || "").trim();
  const ytEmbed = extractYouTubeEmbedUrl(url);
  const isPdf = item.type === "pdf" || /\.pdf($|\?)/i.test(url);
  const isDirectVideo =
    url &&
    !ytEmbed &&
    !isPdf &&
    (/\.(mp4|webm|mov)($|\?)/i.test(url) || url.startsWith("blob:") || url.startsWith("data:video"));

  let mediaHtml = "";
  if (ytEmbed) {
    mediaHtml = `
      <div style="border-radius:16px;overflow:hidden;background:#000;position:relative;padding-bottom:56.25%;height:0;margin-bottom:16px;">
        <iframe src="${esc(ytEmbed)}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen allow="autoplay; encrypted-media"></iframe>
      </div>`;
  } else if (isDirectVideo) {
    mediaHtml = `
      <video src="${esc(url)}" controls autoplay playsinline style="width:100%;max-height:420px;border-radius:16px;background:#000;margin-bottom:16px;border:1px solid rgba(255,255,255,0.1);"></video>`;
  } else if (isPdf && url) {
    mediaHtml = `
      <iframe src="${esc(url)}" style="width:100%;height:62vh;border-radius:14px;border:1px solid rgba(255,255,255,0.12);background:#fff;margin-bottom:14px;"></iframe>
      <div style="text-align:right;margin-bottom:10px;">
        <a href="${esc(url)}" target="_blank" rel="noopener" class="btn-portal-secondary"><i class="fa-solid fa-up-right-from-square"></i> Abrir documento completo</a>
      </div>`;
  } else if (url) {
    mediaHtml = `
      <div style="padding:20px;background:rgba(255,255,255,0.04);border-radius:16px;border:1px solid rgba(255,255,255,0.1);margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;">
        <span style="font-size:13px;color:#d1d5db;word-break:break-all;">${esc(url)}</span>
        <a href="${esc(url)}" target="_blank" rel="noopener" class="btn-portal-primary" style="padding:10px 18px;border-radius:12px;font-size:12.5px;text-decoration:none;">Abrir Recurso Externo ↗</a>
      </div>`;
  }

  const points = Array.isArray(item.points) && item.points.length
    ? `<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:18px 20px;margin-top:8px;">
        <h4 style="font-size:12px;text-transform:uppercase;letter-spacing:0.12em;color:#EC4899;margin:0 0 12px;font-weight:800;">Puntos Clave de Ejecución</h4>
        <ul style="list-style:none;display:grid;gap:10px;margin:0;padding:0;">
          ${item.points
            .map(
              (pt) => `
            <li style="display:flex;gap:10px;align-items:flex-start;font-size:13.5px;color:#e5e7eb;line-height:1.5;">
              <i class="fa-solid fa-circle-check" style="color:#10B981;margin-top:4px;flex-shrink:0;"></i>
              <span>${esc(pt)}</span>
            </li>`
            )
            .join("")}
        </ul>
      </div>`
    : "";

  bodyEl.innerHTML = `
    <p style="color:#b5b0c0;font-size:14px;margin:0 0 16px;line-height:1.55;">${esc(item.desc || "")}</p>
    ${mediaHtml}
    ${points}
  `;

  modal.style.display = "flex";
}

export function cerrarVideoModal(e) {
  if (e && e.target && e.target.id !== "video-preview-modal" && !e.target.closest("button")) return;
  const modal = document.getElementById("video-preview-modal");
  const bodyEl = document.getElementById("modal-video-body");
  if (modal) modal.style.display = "none";
  if (bodyEl) bodyEl.innerHTML = "";
}

// ==========================================================================
// PORTAL 3: SOPORTE ÉLITE (WHATSAPP ADVISORS, AI CHAT, TICKETS & SOCIALS)
// ==========================================================================
export function syncSupportToPortal() {
  const waEl = document.getElementById("soporte-list");
  const deptSelect = document.getElementById("pt-dept");
  const contacts = Array.isArray(state.supportContacts) ? state.supportContacts : [];

  if (deptSelect) {
    deptSelect.innerHTML = contacts.length
      ? contacts.map((c) => `<option value="${esc(c.name)}">${esc(c.name)}</option>`).join("")
      : `<option value="Soporte General">Soporte General</option>`;
  }

  if (!waEl) return;
  const validContacts = contacts.filter((c) => c && String(c.whatsapp || "").replace(/[^0-9]/g, "").length >= 7);

  if (!validContacts.length) {
    waEl.innerHTML = "";
    return;
  }

  waEl.innerHTML =
    `<div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center;">` +
    validContacts
      .map((c) => {
        const waNum = String(c.whatsapp).replace(/[^0-9]/g, "");
        const waUrl = `https://api.whatsapp.com/send?phone=${waNum}&text=${encodeURIComponent(
          `Hola ${c.name}, solicito asistencia oficial de STARMAKER Streamers`
        )}`;
        return `
        <a href="${waUrl}" target="_blank" rel="noopener" style="padding:11px 18px;background:linear-gradient(135deg,#25D366,#128C7E);color:#fff;text-decoration:none;border-radius:14px;font-weight:800;font-size:13px;display:inline-flex;align-items:center;gap:8px;box-shadow:0 8px 20px rgba(37,211,102,0.28);transition:transform 0.2s;">
          <i class="fa-brands fa-whatsapp" style="font-size:16px;"></i>
          <span>${esc(c.name)}</span>
          <span style="font-size:10.5px;opacity:0.85;font-weight:600;">(${esc(c.role || "Oficial")}) ↗</span>
        </a>`;
      })
      .join("") +
    `</div>`;
}

export function syncSocialsToPortal() {
  const bar = document.getElementById("portal-socials-bar");
  if (!bar) return;

  const socials = state.socials || {};
  const entries = [
    { key: "instagram", label: "Instagram Oficial", icon: "fa-brands fa-instagram", color: "#EC4899" },
    { key: "tiktok", label: "TikTok Oficial", icon: "fa-brands fa-tiktok", color: "#fff" },
    { key: "facebook", label: "Facebook Oficial", icon: "fa-brands fa-facebook", color: "#3B82F6" }
  ].filter((item) => socials[item.key] && String(socials[item.key]).startsWith("http"));

  bar.innerHTML = entries
    .map(
      (item) => `
      <a href="${esc(socials[item.key])}" target="_blank" rel="noopener" class="social-pill-link">
        <i class="${item.icon}" style="color:${item.color};font-size:14px;"></i>
        <span>${item.label}</span>
      </a>`
    )
    .join("");
}

export function enviarMensajeChat(e) {
  if (e) e.preventDefault();
  const input = document.getElementById("chat-input");
  const chatMessages = document.getElementById("chat-messages");
  if (!input || !chatMessages) return;

  const text = input.value.trim();
  if (!text) return;

  const userDiv = document.createElement("div");
  userDiv.className = "chat-msg chat-user";
  userDiv.innerHTML = `
    <div class="chat-avatar"><i class="fa-solid fa-user"></i></div>
    <div class="chat-bubble user-bubble">${esc(text)}</div>
  `;
  chatMessages.appendChild(userDiv);
  input.value = "";
  chatMessages.scrollTop = chatMessages.scrollHeight;

  const typingDiv = document.createElement("div");
  typingDiv.className = "chat-msg chat-bot";
  typingDiv.id = "bot-typing-indicator";
  typingDiv.innerHTML = `
    <div class="chat-avatar"><i class="fa-solid fa-robot"></i></div>
    <div class="chat-bubble bot-bubble" style="color:#9ca3af;font-style:italic;">
      <i class="fa-solid fa-circle-notch fa-spin"></i> Escribiendo...
    </div>
  `;
  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  setTimeout(() => {
    document.getElementById("bot-typing-indicator")?.remove();

    const lower = text.toLowerCase();
    let reply = "";

    if (lower.includes("registro") || lower.includes("postul") || lower.includes("aprob") || lower.includes("tiempo") || lower.includes("requisito")) {
      reply = "Tu postulación es revisada por los reclutadores oficiales en 24 a 48 horas hábiles. Completa el formulario del Portal 1 con tu video de 10s e identificación legible.";
    } else if (lower.includes("diamante") || lower.includes("cobr") || lower.includes("pago") || lower.includes("dinero") || lower.includes("retir")) {
      reply = "Los diamantes recibidos durante tus Lives se contabilizan en tiempo real. Las liquidaciones se procesan los días 15 y 30 de cada mes.";
    } else if (lower.includes("pk") || lower.includes("batalla") || lower.includes("bono") || lower.includes("evento")) {
      reply = "Las batallas PK activan multiplicadores de x1.5 a x2.5 y bonos por rachas en horario estelar. Revisa la guía 'Ganar Batallas PK' en el Portal Academia.";
    } else if (lower.includes("asesor") || lower.includes("humano") || lower.includes("whatsapp") || lower.includes("agente") || lower.includes("ticket")) {
      reply = "Puedes pulsar 'Hablar con Agente' para abrir WhatsApp directo o pulsar 'Crear Ticket' arriba a la derecha para registrar tu caso en nuestra Mesa Concierge.";
    } else if (lower.includes("audio") || lower.includes("micro") || lower.includes("luces") || lower.includes("setup")) {
      reply = "En el Portal 2 (Academia StarMaker) tienes guías prácticas sobre iluminación escénica, encuadre y configuración de micrófono sin eco.";
    } else {
      reply = "¡Recibido! Si deseas atención personalizada de un oficial, pulsa 'Crear Ticket' para enviarlo directamente al Panel Administrativo o 'Hablar con Agente' para ir a WhatsApp.";
    }

    const botDiv = document.createElement("div");
    botDiv.className = "chat-msg chat-bot";
    botDiv.innerHTML = `
      <div class="chat-avatar"><i class="fa-solid fa-robot"></i></div>
      <div class="chat-bubble bot-bubble">${esc(reply)}</div>
    `;
    chatMessages.appendChild(botDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, 420);
}

export function enviarMensajeChip(txt) {
  const input = document.getElementById("chat-input");
  if (!input) return;
  input.value = txt;
  enviarMensajeChat();
}

export function conectarAsesorHumano() {
  const firstLink = document.querySelector("#soporte-list a");
  if (firstLink?.href) {
    window.open(firstLink.href, "_blank", "noopener");
  } else {
    window.open(
      "https://api.whatsapp.com/send?text=Hola%2C%20solicito%20asistencia%20oficial%20de%20STARMAKER%20Streamers",
      "_blank",
      "noopener"
    );
  }
}

export function togglePublicTicketForm() {
  const panel = document.getElementById("public-ticket-panel");
  if (!panel) return;
  const opening = panel.style.display === "none";
  panel.style.display = opening ? "block" : "none";
  if (opening) {
    syncSupportToPortal();
    panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

export async function submitPublicTicket(e) {
  e.preventDefault();
  const nameEl = document.getElementById("pt-name");
  const deptEl = document.getElementById("pt-dept");
  const msgEl = document.getElementById("pt-msg");
  if (!nameEl?.value.trim() || !msgEl?.value.trim()) return;

  const ticket = await submitTicketEverywhere({
    name: nameEl.value,
    cat: deptEl?.value || "Soporte General",
    msg: msgEl.value
  });

  e.target.reset();
  document.getElementById("public-ticket-panel").style.display = "none";
  toast("Ticket enviado", `Folio ${ticket.id} registrado en Mesa Concierge.`);
}
