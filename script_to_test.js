
    import { initializeApp } from "firebase/app";
    import { getFirestore, doc, onSnapshot, setDoc, collection, addDoc, getDocs } from "firebase/firestore";
    import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";

    const firebaseConfig = {
      apiKey: "AIzaSyC3iwfeStY1ANVcGIsH8rJD-8rJ5n_p_fE",
      authDomain: "starmaker-505b7.firebaseapp.com",
      projectId: "starmaker-505b7",
      storageBucket: "starmaker-505b7.firebasestorage.app",
      messagingSenderId: "52809712878",
      appId: "1:52809712878:web:49c92142f243a951a5dfff",
      measurementId: "G-MYD1M5XRTY"
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);
    const stateDocRef = doc(db, "systemSettings", "globalStateDev4");

    const defaultCards = [
      {
        id: "card-streamer",
        title: "León",
        subtitle: "Mascota Holográfica",
        badge: "LIVE HUB",
        link: "#formulario-registro",
        videoUrl: "/leonsito.webm"
      }
    ];

    function renderCards(cards) {
      const container = document.getElementById("cards-grid-box");
      if (!container) return;
      container.innerHTML = "";

      cards.forEach((card, idx) => {
        const padIndex = String(idx + 1).padStart(2, "0");
        const article = document.createElement("article");
        article.className = "card";
        article.innerHTML = `
          <div class="card-art" style="height: 100%;">
            <div class="meteor-glow"></div>
            <video class="hero-mascot-video" src="${card.videoUrl || ''}" autoplay loop muted playsinline disablepictureinpicture style="position: absolute; width: 100%; height: 100%; z-index: 2; object-fit: contain; pointer-events: none; mix-blend-mode: screen; -webkit-mix-blend-mode: screen; transform: translate(var(--video-x, 0px), var(--video-y, 0px)) scale(var(--video-scale, 1));"></video>
            
            <div class="card-content" style="position: absolute; bottom: 20px; left: 0; width: 100%; z-index: 3; display: flex; justify-content: center; padding: 0;">
              <button class="interactive-btn" onclick="window.location.href='${card.link || '#formulario-registro'}'">EXPLORAR →</button>
            </div>
          </div>
        `;

        // Sync Logic
        const videoEl = article.querySelector('.hero-mascot-video');
        const glowEl = article.querySelector('.meteor-glow');
        const btnEl = article.querySelector('.interactive-btn');

        if (videoEl) {
          videoEl.addEventListener('timeupdate', () => {
            const time = videoEl.currentTime;
            const duration = videoEl.duration || 10;
            
            // Si el video dura menos de 6 segundos, calculamos en base a porcentajes (del 60% al 85% del video)
            let isTriggered = false;
            let progress = 0;

            if (duration < 6) {
              const startPct = 0.6;
              const endPct = 0.85;
              const currentPct = time / duration;
              if (currentPct >= startPct && currentPct <= endPct) {
                isTriggered = true;
                progress = (currentPct - startPct) / (endPct - startPct);
              }
            } else {
              if (time >= 6 && time <= 8.5) {
                isTriggered = true;
                progress = (time - 6) / 2.5;
              }
            }
            
            if (isTriggered) {
              btnEl.classList.add('pulse-active');
              glowEl.style.setProperty('--meteor-x', `${progress * 150 - 25}%`);
              glowEl.style.setProperty('--meteor-y', `${20 + Math.sin(progress * Math.PI) * 15}%`);
              glowEl.style.setProperty('--meteor-opacity', '0.8');
            } else {
              btnEl.classList.remove('pulse-active');
              glowEl.style.setProperty('--meteor-opacity', '0');
            }
          });
        }

        article.addEventListener("pointermove", (e) => {
          const rect = article.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width;
          const y = (e.clientY - rect.top) / rect.height;
          article.style.setProperty("--rx", `${(0.5 - y) * 8}deg`);
          article.style.setProperty("--ry", `${(x - 0.5) * 8}deg`);
        });

        article.addEventListener("pointerleave", () => {
          article.style.setProperty("--rx", "0deg");
          article.style.setProperty("--ry", "0deg");
        });

        container.appendChild(article);
      });
    }

    renderCards(defaultCards);

    // ESCUCHAR EN TIEMPO REAL CON FIRESTORE ONSNAPSHOT
    onSnapshot(stateDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.theme?.primary) {
          document.documentElement.style.setProperty("--fuchsia", data.theme.primary);
          document.documentElement.style.setProperty("--coral", data.theme.primary);
          const colEl = document.getElementById("editor-theme-color");
          if (colEl) colEl.value = data.theme.primary;
        }
        
          // Apply dynamic backgrounds
          if (data.bg1) {
            document.body.style.backgroundImage = `url(${data.bg1})`;
          }
          if (data.videoUrl) {
             
             document.querySelectorAll(".hero-mascot-video").forEach(vidEl => {
                vidEl.src = data.videoUrl;
                vidEl.load();
             });
          }
          if (data.textos) {
            const editableElements = document.querySelectorAll('.hero h1, .hero p, .accordion-header h3, .platform-item span, .footer-content p, .highlight');
            editableElements.forEach((el, index) => {
              if (data.textos['texto_' + index]) {
                el.innerHTML = data.textos['texto_' + index];
              }
            });
          }

        if (Array.isArray(data.cards) && data.cards.length > 0) {
          renderCards(data.cards);
          if (data.cards[0]) {
            document.getElementById("editor-c1-title").value = data.cards[0].title || "";
            document.getElementById("editor-c1-desc").value = data.cards[0].subtitle || "";
          }

          
          if (data.layout) {

            
            document.documentElement.style.setProperty("--video-scale", data.layout.videoScale || 1);
            document.documentElement.style.setProperty("--video-x", (data.layout.videoX || 0) + "px");
            document.documentElement.style.setProperty("--video-y", (data.layout.videoY || 0) + "px");

            if(true) {
              
              document.getElementById("admin-video-scale").value = data.layout.videoScale || 1;
              document.getElementById("admin-video-x").value = data.layout.videoX || 0;
              document.getElementById("admin-video-y").value = data.layout.videoY || 0;
              
              
              document.getElementById("val-video-scale").textContent = data.layout.videoScale || 1;
              document.getElementById("val-video-x").textContent = (data.layout.videoX || 0) + "px";
              document.getElementById("val-video-y").textContent = (data.layout.videoY || 0) + "px";
            }
          }
          // Load settings for tutorials and WA
          if (data.whatsapp) {
            if (document.getElementById("admin-wa-1")) document.getElementById("admin-wa-1").value = data.whatsapp[0] || "";
            if (document.getElementById("admin-wa-2")) document.getElementById("admin-wa-2").value = data.whatsapp[1] || "";
            if (document.getElementById("admin-wa-3")) document.getElementById("admin-wa-3").value = data.whatsapp[2] || "";
            
            const waList = document.getElementById("soporte-list");
            if (waList) {
              waList.innerHTML = data.whatsapp.map((link, i) => {
                if(!link) return '';
                return `<a href="${link}" target="_blank" style="padding: 16px 24px; background: #25D366; color: white; text-decoration: none; border-radius: 20px; font-weight: bold;">Soporte Opción ${i+1}</a>`;
              }).join("");
            }
          }
                    if (data.registroVideo !== undefined) {
            if (document.getElementById("admin-registro-video")) document.getElementById("admin-registro-video").value = data.registroVideo || "";
            if (document.getElementById("registro-personaje-video")) document.getElementById("registro-personaje-video").src = data.registroVideo || "";
          }

          if (data.tutorials) {
            if (document.getElementById("admin-tut-1")) document.getElementById("admin-tut-1").value = data.tutorials[0] || "";
            if (document.getElementById("admin-tut-2")) document.getElementById("admin-tut-2").value = data.tutorials[1] || "";
            if (document.getElementById("admin-tut-3")) document.getElementById("admin-tut-3").value = data.tutorials[2] || "";
            
            const tutList = document.getElementById("tutoriales-list");
            if (tutList) {
              tutList.innerHTML = data.tutorials.map(url => {
                if(!url) return '';
                return `<div style="background: rgba(0,0,0,0.5); padding: 12px; border-radius: 12px;"><a href="${url}" target="_blank" style="color: var(--coral);">Ver Tutorial ↗</a></div>`;
              }).join("");
            }
          }

        }
      }
    });

    // CONTROL DEL MODAL ADMIN Y AUTH
    const modal = document.getElementById("admin-modal");
    const openBtn = document.getElementById("btn-open-admin");
    const openHeroBtn = document.getElementById("btn-hero-admin");
    const closeLogin = document.getElementById("btn-close-login");
    const closePanel = document.getElementById("btn-close-panel");
    const loginView = document.getElementById("admin-login-view");
    const panelView = document.getElementById("admin-panel-view");

    let isHardcodedAuthenticated = false;
    function openAdmin() {
      modal.classList.add("is-open");
      if (!isHardcodedAuthenticated) {
        if(loginView) loginView.style.display = "block";
        panelView.style.display = "none";
      } else {
        if(loginView) loginView.style.display = "none";
        panelView.style.display = "block";
      }
    }

    openBtn.onclick = openAdmin;
    if (openHeroBtn) openHeroBtn.onclick = openAdmin;
    closeLogin.onclick = () => modal.classList.remove("is-open");
    closePanel.onclick = () => modal.classList.remove("is-open");

    // FORMULARIO DE LOGIN
    const formLogin = document.getElementById("form-auth-login");
    const authError = document.getElementById("auth-error-msg");

    formLogin.onsubmit = async (e) => {
      e.preventDefault();
      authError.style.display = "none";
      const em = document.getElementById("auth-email").value.trim();
      const pw = document.getElementById("auth-password").value;

      if (em === "SANTIstp" && pw === "Namekusein123") {
        isHardcodedAuthenticated = true;
        loginView.style.display = "none";
        panelView.style.display = "block";
        document.getElementById("auth-email").value = "";
        document.getElementById("auth-password").value = "";
      } else {
        authError.textContent = "Usuario o contraseña incorrectos.";
        authError.style.display = "block";
      }
    };

    // GUARDAR EN FIRESTORE
    const saveBtn = document.getElementById("btn-save-firestore");
    const saveMsg = document.getElementById("save-msg-feedback");

    saveBtn.onclick = async () => {
      saveBtn.disabled = true;
      saveBtn.textContent = "GUARDANDO EN FIRESTORE...";

      
      const layout = {
        

        
        videoScale: parseFloat(document.getElementById("admin-video-scale")?.value || 1),
        videoX: parseInt(document.getElementById("admin-video-x")?.value || 0),
        videoY: parseInt(document.getElementById("admin-video-y")?.value || 0)
      };
      const newTheme = { primary: document.getElementById("editor-theme-color").value };
      const newCards = [
        { 
          id: "card-streamer", 
          title: document.getElementById("editor-c1-title").value, 
          subtitle: document.getElementById("editor-c1-desc").value, 
          badge: "LIVE HUB", 
          link: "#formulario-registro",
          videoUrl: "/leonsito.webm"
        }
      ];

      const whatsapp = [
        document.getElementById("admin-wa-1")?.value || "",
        document.getElementById("admin-wa-2")?.value || "",
        document.getElementById("admin-wa-3")?.value || ""
      ];
            const registroVideo = document.getElementById("admin-registro-video")?.value || "";

      const tutorials = [
        document.getElementById("admin-tut-1")?.value || "",
        document.getElementById("admin-tut-2")?.value || "",
        document.getElementById("admin-tut-3")?.value || ""
      ];
      const cleanState = JSON.parse(JSON.stringify({ theme: newTheme, cards: newCards, whatsapp, tutorials, layout, registroVideo }));

      try {
        await setDoc(stateDocRef, cleanState, { merge: true });
        saveMsg.textContent = "✓ Sincronizado exitosamente con Firestore";
        saveMsg.style.display = "block";
        setTimeout(() => { saveMsg.style.display = "none"; modal.classList.remove("is-open"); }, 1400);
      } catch (err) {
        saveMsg.textContent = "⚠ Error: " + err.message;
        saveMsg.style.display = "block";
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = "GUARDAR EN FIRESTORE EN TIEMPO REAL";
      }
    };

    // UPLOADER A VERCEL SERVERLESS
    const fileInput = document.getElementById("media-file-input");
    const statusLabel = document.getElementById("upload-status-label");

    if (fileInput) {
      fileInput.onchange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        statusLabel.textContent = "Transmitiendo por Serverless Proxy...";
        try {
          const reader = new FileReader();
          const b64 = await new Promise((res, rej) => {
            reader.onload = () => res(reader.result.split(',')[1]);
            reader.onerror = () => rej(new Error("Error leyendo archivo"));
            reader.readAsDataURL(file);
          });

          const cleanName = String(file.name || "media").replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
          const response = await fetch("/api/upload-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileBase64: b64, mimeType: file.type, fileName: cleanName })
          });

          const data = await response.json();
          if (!response.ok) throw new Error(data.error || "Fallo en la subida");
          statusLabel.textContent = "✓ Subido: " + data.url;
        } catch (err) {
          statusLabel.textContent = "⚠ Error: " + err.message;
        }
      };
    }
  
    
    const inputs = ["video-scale", "video-x", "video-y"];
    inputs.forEach(id => {
      const el = document.getElementById("admin-" + id);
      const valEl = document.getElementById("val-" + id);
      if (el) {
        el.addEventListener("input", (e) => {
          const val = e.target.value;
          const unit = id.includes("x") || id.includes("y") ? "px" : "";
          document.documentElement.style.setProperty("--" + id, val + unit);
          if (valEl) valEl.textContent = val + unit;
        });
      }
    });
    // === VIDEO RECORDER HANDLER ===
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
            
            try {
              // 1. Obtener el mejor servidor de GoFile disponible
              const serverRes = await fetch("https://api.gofile.io/servers");
              const serverData = await serverRes.json();
              if(serverData.status !== "ok") throw new Error("No se pudo contactar al servidor de videos.");
              const bestServer = serverData.data.servers[0].name;

              // 2. Subir el video a GoFile
              const formData = new FormData();
              formData.append("file", blob, fileName);
              
              formData.append("token", "LBRXKRTeYjMsKssLNP2ndcCb6SUi3rBP");
              const uploadRes = await fetch(`https://${bestServer}.gofile.io/contents/uploadfile`, {
                method: "POST",
                body: formData
              });
              const uploadData = await uploadRes.json();
              
              if(uploadData.status !== "ok") throw new Error("Error al procesar el video.");
              
              // 3. Obtener el link público
              const url = uploadData.data.downloadPage;
              
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

    // === FORM SUBMIT HANDLER ===
    const regForm = document.getElementById("native-registration-form");
    if (regForm) {
      regForm.onsubmit = async (e) => {
        e.preventDefault();
        if (!document.getElementById("reg-video-url").value) {
          alert("Por favor, completa la verificación de video de 10 segundos antes de enviar el formulario.");
          return;
        }
        const btn = document.getElementById("btn-submit-reg");
        const feedback = document.getElementById("reg-feedback");
        const status = document.getElementById("reg-upload-status");
        
        btn.disabled = true;
        btn.textContent = "Subiendo archivos y enviando...";
        feedback.style.display = "none";
        status.textContent = "";

        try {
          const fileInput = document.getElementById("reg-id-photos");
          const files = fileInput.files;
          const photoUrls = [];

          // Upload files to GoFile with user's token
          for(let i=0; i < Math.min(files.length, 5); i++) {
            const file = files[i];
            if (file.size > 50 * 1024 * 1024) throw new Error("Un archivo excede los 50MB"); 
            status.textContent = `Subiendo foto ${i+1} de ${Math.min(files.length, 5)} a tu cuenta segura...`;
            
            const srvRes = await fetch("https://api.gofile.io/servers");
            const srvData = await srvRes.json();
            const server = srvData.data.servers[0].name;

            const fd = new FormData();
            fd.append("file", file);
            fd.append("token", "LBRXKRTeYjMsKssLNP2ndcCb6SUi3rBP");

            const response = await fetch(`https://${server}.gofile.io/contents/uploadfile`, {
              method: "POST",
              body: fd
            });

            const data = await response.json();
            if (data.status !== "ok") throw new Error("Error al subir imagen a GoFile");
            photoUrls.push(data.data.downloadPage);
          }

          // === ENVÍO DIRECTO A EXCEL ONLINE (VÍA NUESTRO BACKEND) ===
          status.textContent = "Guardando registro de forma segura...";
          
          // Construimos el objeto JSON estructurado con todos los campos
          const registroPayload = {
            nombre: document.getElementById("reg-name").value,
            email: document.getElementById("reg-email").value,
            telefono: document.getElementById("reg-phone").value,
            agencia: document.getElementById("reg-agency").value,
            tuId: document.getElementById("reg-id").value,
            agentId: document.getElementById("reg-agent-id").value,
            nacionalidad: document.getElementById("reg-nationality").value,
            ciudad: document.getElementById("reg-city").value,
            talento: document.getElementById("reg-talent").value,
            genero: document.getElementById("reg-gender").value,
            plataforma: document.getElementById("reg-platform").value,
            videoUrl: document.getElementById("reg-video-url").value,
            fotosUrl: photoUrls.join(" | ") // Separamos los links por un |
          };

          // Llamamos a nuestro propio backend en Vercel (totalmente invisible y sin CORS)
          const dbResponse = await fetch('/api/submit-excel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registroPayload)
          });

          const dbResult = await dbResponse.json();

          if (!dbResponse.ok) {
            throw new Error(dbResult.error || "Fallo de conexión con la base de datos.");
          }
          
          // Imprimimos confirmación en consola para debug
          console.log("¡Éxito! Registro guardado en la nube:", registroPayload);
          
          feedback.textContent = "¡Registro completado y guardado con éxito!";
          feedback.style.display = "block";
          regForm.reset();
          document.getElementById("record-preview").style.display = "none";
          document.getElementById("record-status").textContent = "";
          status.textContent = "";
        } catch(err) {
          alert("Error al enviar el registro: " + err.message);
          feedback.textContent = "Ocurrió un error. Inténtalo nuevamente.";
          feedback.style.color = "red";
          feedback.style.display = "block";
        } finally {
          btn.disabled = false;
          btn.textContent = "Enviar Postulación";
        }
      };
    }


    // ==========================================
    // LÓGICA DEL MODO EDITOR VISUAL (FLOTANTE)
    // ==========================================
    const btnModoEditor = document.getElementById("btn-modo-editor");
    const editorToolbar = document.getElementById("visual-editor-toolbar");
    const editorExitBtn = document.getElementById("editor-exit-btn");
    const editorSaveBtn = document.getElementById("editor-save-btn");
    const uploadPngInput = document.getElementById("editor-upload-png");
    const uploadVideoInput = document.getElementById("editor-upload-video");
    
    
    ['admin-tut-1-file', 'admin-tut-2-file', 'admin-tut-3-file'].forEach((id, index) => {
      const input = document.getElementById(id);
      if (input) {
        input.addEventListener('change', async (e) => {
          const file = e.target.files[0];
          if(!file) return;
          const oldLabel = input.parentElement.innerHTML;
          input.parentElement.innerHTML = "⏳ SUBIENDO...";
          try {
            const url = await uploadToGoFile(file);
            const key = 'tut' + (index + 1); // e.g. tut1, tut2, tut3
            await setDoc(stateDocRef, { [key]: url }, { merge: true });
            alert("Tutorial " + (index+1) + " subido con éxito!");
          } catch(err) {
            alert("Error: " + err.message);
          } finally {
            location.reload();
          }
        });
      }
    });

    // Todos los elementos de texto que queremos que sean editables
    const editableElements = document.querySelectorAll('.hero h1, .hero p, .accordion-header h3, .platform-item span, .footer-content p, .highlight');
    
    if (btnModoEditor) {
      btnModoEditor.addEventListener("click", () => {
        // Cerrar panel admin y abrir modo editor
        document.getElementById("admin-modal").classList.remove("is-open");
        editorToolbar.style.display = "flex";
        document.body.classList.add("editor-active");
        
        // Hacer textos editables
        editableElements.forEach(el => {
          el.contentEditable = "true";
          // Guardar su valor original por si queremos deshacer
          if(!el.hasAttribute("data-original")) {
            el.setAttribute("data-original", el.innerHTML);
          }
        });
      });
    }

    if (editorExitBtn) {
      editorExitBtn.addEventListener("click", () => {
        editorToolbar.style.display = "none";
        document.body.classList.remove("editor-active");
        editableElements.forEach(el => el.contentEditable = "false");
      });
    }
    
    // Función genérica para subir a GoFile (Directo desde el navegador, sin problemas de CORS)
    async function uploadToGoFile(file) {
      const srvRes = await fetch("https://api.gofile.io/servers");
      const srvData = await srvRes.json();
      const server = srvData.data.servers[0].name;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("token", "LBRXKRTeYjMsKssLNP2ndcCb6SUi3rBP");

      const res = await fetch(`https://${server}.gofile.io/contents/uploadfile`, {
        method: "POST",
        body: formData
      });
      
      const uploadData = await res.json();
      if (uploadData.status !== "ok") throw new Error("Error al subir a GoFile");
      
      // GoFile devuelve un downloadPage. Intentamos extraer el link directo si la API lo provee, 
      // de lo contrario usamos la página de descarga.
      return uploadData.data.downloadPage;
    }

    if (uploadPngInput) {
      uploadPngInput.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if(!file) return;
        
        const oldLabel = uploadPngInput.parentElement.innerHTML;
        uploadPngInput.parentElement.innerHTML = "⏳ SUBIENDO...";
        
        try {
          const url = await uploadToGoFile(file);
          await setDoc(stateDocRef, { bg1: url, bg2: url }, { merge: true });
          alert("¡Fondo PNG actualizado con éxito!");
        } catch(err) {
          alert("Error al subir PNG: " + err.message);
        } finally {
          location.reload(); 
        }
      });
    }

    if (uploadVideoInput) {
      uploadVideoInput.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if(!file) return;
        
        const oldLabel = uploadVideoInput.parentElement.innerHTML;
        uploadVideoInput.parentElement.innerHTML = "⏳ SUBIENDO...";
        
        try {
          const url = await uploadToGoFile(file);
          await setDoc(stateDocRef, { videoUrl: url }, { merge: true });
          alert("¡Video Holográfico actualizado con éxito!");
        } catch(err) {
          alert("Error al subir Video: " + err.message);
        } finally {
          location.reload();
        }
      });
    }

    if (editorSaveBtn) {
      editorSaveBtn.addEventListener("click", async () => {
        editorSaveBtn.textContent = "⏳ GUARDANDO...";
        const textosGuardados = {};
        editableElements.forEach((el, index) => {
          textosGuardados['texto_' + index] = el.innerHTML;
        });

        try {
          await setDoc(stateDocRef, { textos: textosGuardados }, { merge: true });
          editorSaveBtn.textContent = "✓ GUARDADO";
          setTimeout(() => editorSaveBtn.textContent = "💾 GUARDAR TEXTOS", 2000);
        } catch(e) {
          alert("Error al guardar: " + e.message);
          editorSaveBtn.textContent = "💾 GUARDAR TEXTOS";
        }
      });
    }


    // === DATABASE DOWNLOAD HANDLER ===
    const btnDownload = document.getElementById("btn-download-db");
    if (btnDownload) {
      btnDownload.onclick = async () => {
        btnDownload.disabled = true;
        btnDownload.textContent = "Generando CSV...";
        try {
          const snapshot = await getDocs(collection(db, "registros_form"));
          if (snapshot.empty) {
            alert("No hay registros en la base de datos.");
            return;
          }

          let csv = "Fecha,Correo,Agencia,Tu ID,ID Agente,Nombre Completo,Teléfono,Nacionalidad,Ciudad,Fotos(URLs),Talento,Género,Plataforma,Video Verificación\n";
          snapshot.forEach(docSnap => {
            const d = docSnap.data();
            const fotosStr = (d.photos || []).join(" ; ");
            const row = [
              d.timestamp || "", d.email || "", d.agency || "", d.tuId || "", d.agentId || "", 
              d.fullName || "", d.phone || "", d.nationality || "", d.city || "", 
              fotosStr, d.talent || "", d.gender || "", d.platform || "", d.verificationVideo || ""
            ].map(val => `"${String(val).replace(/"/g, '""')}"`);
            csv += row.join(",") + "\n";
          });

          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.setAttribute("download", "Starmaker_Registros.csv");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch(err) {
          alert("Error descargando BD: " + err.message);
        } finally {
          btnDownload.disabled = false;
          btnDownload.textContent = "Descargar DATABASE (.CSV)";
        }
      };
    }
