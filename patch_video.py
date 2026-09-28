import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Inject HTML for the video recorder
platform_input = '<input type="text" class="admin-input" id="reg-platform" placeholder="¿Con qué plataforma has colaborado? *" required />'
video_html = """<input type="text" class="admin-input" id="reg-platform" placeholder="¿Con qué plataforma has colaborado? *" required />

              <div style="display: flex; flex-direction: column; gap: 8px; border: 1px solid var(--line); padding: 16px; border-radius: 8px; background: rgba(0,0,0,0.3); margin-top: 8px;">
                <label style="font-size: 14px; color: var(--coral); font-weight: bold;">Verificación de Identidad (Video de 10s) *</label>
                <p style="font-size: 12px; color: var(--muted); margin: 0;">Presiona el botón, permite el acceso a tu cámara y graba un video corto para verificar tu identidad.</p>
                <div style="display: flex; gap: 10px; align-items: center; margin-top: 8px;">
                  <button type="button" id="btn-record-video" style="background: #E64381; color: white; padding: 10px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; width: 100%;">📹 Grabar Video (10s)</button>
                </div>
                <div id="record-status" style="font-size: 12px; font-weight: bold; color: #4CAF50; text-align: center; margin-top: 4px;"></div>
                <video id="record-preview" style="display: none; width: 100%; border-radius: 8px; margin-top: 10px; border: 1px solid var(--line-bright);" autoplay playsinline></video>
                <input type="hidden" id="reg-video-url" required />
              </div>"""

content = content.replace(platform_input, video_html)

# 2. Inject JS for MediaRecorder
submit_handler_marker = "// === FORM SUBMIT HANDLER ==="
video_js = """// === VIDEO RECORDER HANDLER ===
    const btnRecord = document.getElementById("btn-record-video");
    const recordPreview = document.getElementById("record-preview");
    const recordStatus = document.getElementById("record-status");
    const regVideoUrl = document.getElementById("reg-video-url");

    if (btnRecord) {
      btnRecord.onclick = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: { ideal: 480 }, height: { ideal: 640 }, frameRate: { ideal: 15 } }, 
            audio: true 
          });
          recordPreview.srcObject = stream;
          recordPreview.style.display = "block";
          recordPreview.muted = true;
          recordPreview.play();

          let options = { videoBitsPerSecond: 250000 };
          if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
            options.mimeType = 'video/webm;codecs=vp9';
          } else if (MediaRecorder.isTypeSupported('video/webm')) {
            options.mimeType = 'video/webm';
          } else if (MediaRecorder.isTypeSupported('video/mp4')) {
            options.mimeType = 'video/mp4';
          }

          const recorder = new MediaRecorder(stream, options);
          const chunks = [];
          
          recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
          
          recorder.onstop = async () => {
            stream.getTracks().forEach(t => t.stop());
            recordPreview.style.display = "none";
            recordStatus.textContent = "Comprimiendo y subiendo video...";
            recordStatus.style.color = "#E64381";
            btnRecord.disabled = true;

            const blob = new Blob(chunks, { type: recorder.mimeType || 'video/webm' });
            const fileName = 'verif_' + Date.now() + '.webm';
            const fileRef = ref(storage, 'registros/videos/' + fileName);
            
            try {
              await uploadBytes(fileRef, blob);
              const url = await getDownloadURL(fileRef);
              regVideoUrl.value = url;
              recordStatus.textContent = "✓ Video grabado y subido exitosamente";
              recordStatus.style.color = "#4CAF50";
            } catch(e) {
              recordStatus.textContent = "⚠ Error al subir: " + e.message;
              recordStatus.style.color = "red";
              btnRecord.disabled = false;
              btnRecord.textContent = "Reintentar Grabación";
              btnRecord.style.background = "#E64381";
            }
          };

          recorder.start();
          btnRecord.textContent = "🔴 Grabando (10s)...";
          btnRecord.style.background = "red";
          btnRecord.disabled = true;

          let timeLeft = 10;
          const interval = setInterval(() => {
            timeLeft--;
            if(timeLeft > 0) {
              btnRecord.textContent = `🔴 Grabando (${timeLeft}s)...`;
            } else {
              clearInterval(interval);
              recorder.stop();
              btnRecord.textContent = "Procesando...";
              btnRecord.style.background = "#77707d";
            }
          }, 1000);

        } catch (err) {
          alert("Error accediendo a la cámara. Asegúrate de dar permisos: " + err.message);
        }
      };
    }

    // === FORM SUBMIT HANDLER ==="""

content = content.replace(submit_handler_marker, video_js)

# 3. Add verification check in Form Submit
prevent_default_regex = r'(regForm\.onsubmit = async \(e\) => \{\s*e\.preventDefault\(\);)'
validation_check = r"""\1
        if (!document.getElementById("reg-video-url").value) {
          alert("Por favor, completa la verificación de video de 10 segundos antes de enviar el formulario.");
          return;
        }"""
content = re.sub(prevent_default_regex, validation_check, content, count=1)

# 4. Add verificationVideo to Firestore payload
platform_val_regex = r'(platform: document\.getElementById\("reg-platform"\)\.value,)'
new_platform_val = r'\1\n            verificationVideo: document.getElementById("reg-video-url").value,'
content = re.sub(platform_val_regex, new_platform_val, content, count=1)

# 5. Add Video to CSV Export
csv_header_regex = r'(let csv = "Fecha.*Plataforma)(\\n";)'
content = re.sub(csv_header_regex, r'\1,Video Verificación\2', content, count=1)

csv_row_regex = r'(fotosStr, d\.talent \|\| "", d\.gender \|\| "", d\.platform \|\| "")'
content = re.sub(csv_row_regex, r'\1, d.verificationVideo || ""', content, count=1)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)

