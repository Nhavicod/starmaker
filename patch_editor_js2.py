import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

editor_js = """
    // ==========================================
    // LÓGICA DEL MODO EDITOR VISUAL (FLOTANTE)
    // ==========================================
    const btnModoEditor = document.getElementById("btn-modo-editor");
    const editorToolbar = document.getElementById("visual-editor-toolbar");
    const editorExitBtn = document.getElementById("editor-exit-btn");
    const editorSaveBtn = document.getElementById("editor-save-btn");
    const uploadPngInput = document.getElementById("editor-upload-png");
    const uploadVideoInput = document.getElementById("editor-upload-video");
    
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
    
    // Función genérica para subir a Catbox
    async function uploadToCatbox(file) {
      const formData = new FormData();
      formData.append("reqtype", "fileupload");
      formData.append("fileToUpload", file);
      
      const res = await fetch("https://catbox.moe/user/api.php", {
        method: "POST",
        body: formData
      });
      if(!res.ok) throw new Error("Error subiendo a Catbox");
      return await res.text();
    }

    if (uploadPngInput) {
      uploadPngInput.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if(!file) return;
        
        const oldLabel = uploadPngInput.parentElement.innerHTML;
        uploadPngInput.parentElement.innerHTML = "⏳ SUBIENDO...";
        
        try {
          const url = await uploadToCatbox(file);
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
          const url = await uploadToCatbox(file);
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
"""

html = html.replace("    // === DATABASE DOWNLOAD HANDLER ===", editor_js + "\n\n    // === DATABASE DOWNLOAD HANDLER ===")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
