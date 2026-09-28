import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Replace the Google Form section (lines 498-533 roughly)
# We look for <section class="section"> and "REGISTRO Y CONVOCATORIA" inside it, and replace it up to </section>

form_section_regex = r'<section class="section"[^>]*>[\s\S]*?<div class="kicker">04 · REGISTRO Y CONVOCATORIA</div>[\s\S]*?</section>'

new_sections_html = """
      <section class="section" id="formulario-registro">
        <div class="container">
          <div class="section-header">
            <div>
              <div class="kicker">04 · REGISTRO Y CONVOCATORIA</div>
              <h2>Postula a<br><span class="gradient-text">STARMAKER.</span></h2>
            </div>
            <p class="section-desc">
              Completa el cuestionario oficial. Tus respuestas se guardarán directamente en nuestra base de datos.
            </p>
          </div>

          <div class="panel" style="padding: 24px; border-radius: var(--radius); overflow: hidden; background: rgba(12, 10, 18, 0.75); border: 1px solid var(--line-bright); box-shadow: var(--shadow);">
            <form id="native-registration-form" style="display: flex; flex-direction: column; gap: 16px;">
              <input type="email" class="admin-input" id="reg-email" placeholder="Correo electrónico *" required />
              <input type="text" class="admin-input" id="reg-agency" placeholder="Nombre de tu agencia *" required />
              <input type="text" class="admin-input" id="reg-id" placeholder="Tú ID *" required />
              <input type="text" class="admin-input" id="reg-agent-id" placeholder="ID de Tú Agente *" required />
              <input type="text" class="admin-input" id="reg-name" placeholder="Nombre y apellido completo *" required />
              <input type="tel" class="admin-input" id="reg-phone" placeholder="Número de teléfono (con prefijo) *" required />
              <input type="text" class="admin-input" id="reg-nationality" placeholder="Nacionalidad *" required />
              <input type="text" class="admin-input" id="reg-city" placeholder="¿Dónde vive? (Ciudad) *" required />
              
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <label style="font-size: 14px; color: var(--coral);">Foto de identificación (lado de frente y atrás) * (Sube hasta 5 archivos de imagen)</label>
                <input type="file" id="reg-id-photos" class="admin-input" accept="image/*" multiple required />
                <div id="reg-upload-status" style="font-size: 12px; color: var(--muted);"></div>
              </div>

              <input type="text" class="admin-input" id="reg-talent" placeholder="¿Cuál es tu talento? *" required />
              
              <select class="admin-input" id="reg-gender" required>
                <option value="" disabled selected>¿Tu género? *</option>
                <option value="femenino">Femenino</option>
                <option value="Masculino">Masculino</option>
                <option value="Prefiero no decirlo">Prefiero no decirlo</option>
                <option value="otro">Otro</option>
              </select>

              <input type="text" class="admin-input" id="reg-platform" placeholder="¿Con qué plataforma has colaborado? *" required />

              <button type="submit" id="btn-submit-reg" style="background: var(--coral); color: #fff; padding: 16px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; text-transform: uppercase;">Enviar Postulación</button>
              <div id="reg-feedback" style="display: none; text-align: center; color: #4CAF50; font-weight: bold; padding: 10px;"></div>
            </form>
          </div>
        </div>
      </section>

      <section class="section" id="tutoriales">
        <div class="container">
          <div class="section-header">
            <div>
              <div class="kicker">05 · VIDEOTUTORIALES</div>
              <h2>Aprende con<br><span class="gradient-text">Nosotros.</span></h2>
            </div>
            <p class="section-desc">Recursos oficiales subidos desde el panel de administración.</p>
          </div>
          <div id="tutoriales-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
            <!-- Renderizado dinámico -->
          </div>
        </div>
      </section>

      <section class="section" id="dudas">
        <div class="container">
          <div class="section-header">
            <div>
              <div class="kicker">06 · SOPORTE Y DUDAS</div>
              <h2>Centro de<br><span class="gradient-text">Ayuda.</span></h2>
            </div>
            <p class="section-desc">Comunícate directamente con nuestro equipo por WhatsApp.</p>
          </div>
          <div id="soporte-list" style="display: flex; flex-wrap: wrap; gap: 16px; justify-content: center;">
            <!-- Renderizado dinámico -->
          </div>
        </div>
      </section>
"""

content = re.sub(form_section_regex, new_sections_html, content, count=1)

# 2. Add Admin Panel fields
# We'll inject them before the "GUARDAR EN FIRESTORE EN TIEMPO REAL" button

admin_html_to_inject = """
            <div style="margin-top:24px; padding-top: 16px; border-top: 1px solid var(--line);">
              <label class="admin-label">BASE DE DATOS (EXCEL)</label>
              <button type="button" id="btn-download-db" class="admin-input" style="background: #4CAF50; color: white; border:none; cursor: pointer; text-transform: uppercase; font-weight: bold;">Descargar DATABASE (.CSV)</button>
            </div>

            <div style="margin-top:24px; padding-top: 16px; border-top: 1px solid var(--line);">
              <label class="admin-label">ENLACES DE SOPORTE (WHATSAPP)</label>
              <input type="text" class="admin-input" id="admin-wa-1" placeholder="Opción 1: https://wa.me/..." />
              <input type="text" class="admin-input" id="admin-wa-2" placeholder="Opción 2: https://wa.me/..." />
              <input type="text" class="admin-input" id="admin-wa-3" placeholder="Opción 3: https://wa.me/..." />
            </div>

            <div style="margin-top:24px; padding-top: 16px; border-top: 1px solid var(--line);">
              <label class="admin-label">VIDEOTUTORIALES (ENLACES DE VIDEO O YOUTUBE)</label>
              <input type="text" class="admin-input" id="admin-tut-1" placeholder="URL Video 1" />
              <input type="text" class="admin-input" id="admin-tut-2" placeholder="URL Video 2" />
              <input type="text" class="admin-input" id="admin-tut-3" placeholder="URL Video 3" />
            </div>
"""

# Replace the UPLOADER block or insert just before the GUARDAR button
btn_save_regex = r'(<button id="btn-save-firestore"[^>]*>GUARDAR EN FIRESTORE EN TIEMPO REAL</button>)'
content = re.sub(btn_save_regex, admin_html_to_inject + r'\1', content, count=1)

# 3. Add JS imports for Firestore additions
import_regex = r'import \{ getFirestore, doc, onSnapshot, setDoc \} from "firebase/firestore";'
new_imports = 'import { getFirestore, doc, onSnapshot, setDoc, collection, addDoc, getDocs } from "firebase/firestore";\n    import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";'
content = content.replace(import_regex, new_imports)

# Initialize storage
init_regex = r'const db = getFirestore\(app\);'
content = content.replace(init_regex, 'const db = getFirestore(app);\n    const storage = getStorage(app);')

# 4. Update the Firestore sync logic
# In onSnapshot
sync_data_regex = r'(if \(data\.cards\[2\]\) \{[^\}]+\})'
new_sync_data = r"""\1
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
"""
content = re.sub(sync_data_regex, new_sync_data, content, count=1)

# In btn-save-firestore
save_data_regex = r'(const cleanState = JSON\.parse\(JSON\.stringify\(\{ theme: newTheme, cards: newCards \}\)\);)'
new_save_data = r"""const whatsapp = [
        document.getElementById("admin-wa-1")?.value || "",
        document.getElementById("admin-wa-2")?.value || "",
        document.getElementById("admin-wa-3")?.value || ""
      ];
      const tutorials = [
        document.getElementById("admin-tut-1")?.value || "",
        document.getElementById("admin-tut-2")?.value || "",
        document.getElementById("admin-tut-3")?.value || ""
      ];
      const cleanState = JSON.parse(JSON.stringify({ theme: newTheme, cards: newCards, whatsapp, tutorials }));"""
content = re.sub(save_data_regex, new_save_data, content, count=1)

# 5. Add Form Submit Handler and DB Download Handler at the very end of the script
script_end_regex = r'(</script>\s*</body>)'
handlers_script = """
    // === FORM SUBMIT HANDLER ===
    const regForm = document.getElementById("native-registration-form");
    if (regForm) {
      regForm.onsubmit = async (e) => {
        e.preventDefault();
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

          // Upload files to Firebase Storage
          for(let i=0; i < Math.min(files.length, 5); i++) {
            const file = files[i];
            if (file.size > 100 * 1024 * 1024) throw new Error("Un archivo excede los 100MB");
            
            const fileRef = ref(storage, 'registros/' + Date.now() + '_' + file.name);
            status.textContent = `Subiendo archivo ${i+1} de ${Math.min(files.length, 5)}...`;
            await uploadBytes(fileRef, file);
            const url = await getDownloadURL(fileRef);
            photoUrls.push(url);
          }

          // Save document to Firestore
          status.textContent = "Guardando datos...";
          const formData = {
            email: document.getElementById("reg-email").value,
            agency: document.getElementById("reg-agency").value,
            tuId: document.getElementById("reg-id").value,
            agentId: document.getElementById("reg-agent-id").value,
            fullName: document.getElementById("reg-name").value,
            phone: document.getElementById("reg-phone").value,
            nationality: document.getElementById("reg-nationality").value,
            city: document.getElementById("reg-city").value,
            photos: photoUrls,
            talent: document.getElementById("reg-talent").value,
            gender: document.getElementById("reg-gender").value,
            platform: document.getElementById("reg-platform").value,
            timestamp: new Date().toISOString()
          };

          await addDoc(collection(db, "registros_form"), formData);
          
          feedback.textContent = "¡Formulario enviado correctamente!";
          feedback.style.display = "block";
          regForm.reset();
          status.textContent = "";
        } catch(err) {
          alert("Error al enviar: " + err.message);
        } finally {
          btn.disabled = false;
          btn.textContent = "Enviar Postulación";
        }
      };
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

          let csv = "Fecha,Correo,Agencia,Tu ID,ID Agente,Nombre Completo,Teléfono,Nacionalidad,Ciudad,Fotos(URLs),Talento,Género,Plataforma\\n";
          snapshot.forEach(docSnap => {
            const d = docSnap.data();
            const fotosStr = (d.photos || []).join(" ; ");
            const row = [
              d.timestamp || "", d.email || "", d.agency || "", d.tuId || "", d.agentId || "", 
              d.fullName || "", d.phone || "", d.nationality || "", d.city || "", 
              fotosStr, d.talent || "", d.gender || "", d.platform || ""
            ].map(val => `"${String(val).replace(/"/g, '""')}"`);
            csv += row.join(",") + "\\n";
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
\\1"""
content = re.sub(script_end_regex, handlers_script, content, count=1)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)

