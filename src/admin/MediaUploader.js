/**
 * STARMAKER Media Uploader Component
 * Integra window.uploadFile con Base64 y Vercel Serverless Function.
 */

window.uploadFile = async function(file) {
  // Conversión a Base64
  const reader = new FileReader();
  const b64 = await new Promise((resolve, reject) => { 
    reader.onload = () => resolve(reader.result.split(',')[1]); 
    reader.onerror = () => reject(new Error("No se pudo leer"));
    reader.readAsDataURL(file); 
  });
  
  const cleanName = String(file.name || "archivo").replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
  
  // Llamada a la API local en Vercel
  const res = await fetch("/api/upload-image", {
    method: "POST", 
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      fileBase64: b64, 
      mimeType: file.type, 
      fileName: cleanName 
    })
  });
  
  let data = {};
  try { data = await res.json(); } catch(e) { throw new Error("La API no respondió JSON"); }
  
  if (!res.ok) throw new Error(data.error || "Fallo en la subida");
  return data.url;
};

export function renderMediaUploader() {
  const container = document.createElement("div");
  container.className = "glass-panel admin-uploader-panel";

  container.innerHTML = `
    <h2 class="editor-section-title">Subir Archivo Multimedia</h2>
    <p class="editor-section-desc">
      Carga videos WebM o imágenes para tus tarjetas. El archivo se procesa vía Serverless Proxy hacia YourImageShare.
    </p>

    <div class="dropzone" id="upload-dropzone">
      <span class="dropzone-icon">⇪</span>
      <p class="dropzone-text">Arrastra un archivo aquí o haz clic para examinar</p>
      <span class="dropzone-hint">Soporta WebM, PNG, JPG, GIF (Máx. 10MB)</span>
      <input type="file" id="file-input" class="file-input-hidden" accept="video/webm,video/mp4,image/png,image/jpeg,image/gif" />
    </div>

    <div id="upload-progress-box" class="upload-progress-box" style="display: none;">
      <div class="progress-bar-track">
        <div id="progress-bar-fill" class="progress-bar-fill" style="width: 0%;"></div>
      </div>
      <span id="upload-status-text" class="upload-status-text">Subiendo archivo...</span>
    </div>

    <div id="upload-result-box" class="upload-result-box" style="display: none;">
      <label>URL Pública Generada:</label>
      <div class="result-input-row">
        <input type="text" id="uploaded-url-field" class="input-text" readonly />
        <button type="button" id="btn-copy-url" class="btn-secondary-sm">Copiar</button>
      </div>
    </div>
  `;

  const dropzone = container.querySelector("#upload-dropzone");
  const fileInput = container.querySelector("#file-input");
  const progressBox = container.querySelector("#upload-progress-box");
  const progressBar = container.querySelector("#progress-bar-fill");
  const statusText = container.querySelector("#upload-status-text");
  const resultBox = container.querySelector("#upload-result-box");
  const urlField = container.querySelector("#uploaded-url-field");
  const copyBtn = container.querySelector("#btn-copy-url");

  dropzone.addEventListener("click", () => fileInput.click());

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("is-dragover");
  });

  dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("is-dragover");
  });

  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("is-dragover");
    if (e.dataTransfer.files?.length) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener("change", (e) => {
    if (e.target.files?.length) {
      handleFileUpload(e.target.files[0]);
    }
  });

  copyBtn.addEventListener("click", () => {
    urlField.select();
    navigator.clipboard.writeText(urlField.value);
    copyBtn.textContent = "¡Copiado!";
    setTimeout(() => {
      copyBtn.textContent = "Copiar";
    }, 2000);
  });

  async function handleFileUpload(file) {
    if (file.size > 10 * 1024 * 1024) {
      alert("El archivo excede el límite máximo de 10MB.");
      return;
    }

    progressBox.style.display = "block";
    resultBox.style.display = "none";
    progressBar.style.width = "20%";
    statusText.textContent = `Leyendo ${file.name}...`;

    try {
      progressBar.style.width = "50%";
      statusText.textContent = "Procesando en proxy Vercel y YourImageShare...";

      const publicUrl = await window.uploadFile(file);

      progressBar.style.width = "100%";
      statusText.textContent = "¡Archivo subido exitosamente!";

      resultBox.style.display = "block";
      urlField.value = publicUrl;
    } catch (err) {
      console.error("[Media Uploader Error]:", err);
      statusText.textContent = `Error: ${err.message}`;
      progressBar.style.width = "0%";
    }
  }

  return container;
}
