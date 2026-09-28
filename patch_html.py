import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# Replace the Google Form section
form_section_regex = r'<section id="registro">[\s\S]*?<div class="kicker">04 · REGISTRO Y CONVOCATORIA</div>[\s\S]*?</section>'

new_sections_html = """
      <section class="section" id="formulario-registro">
        <div class="container" style="max-width: 800px; margin: 0 auto;">
          <div class="section-header" style="text-align: center; margin-bottom: 40px;">
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

              <div style="display: flex; flex-direction: column; gap: 8px; border: 1px solid var(--line); padding: 16px; border-radius: 8px; background: rgba(0,0,0,0.3); margin-top: 8px;">
                <label style="font-size: 14px; color: var(--coral); font-weight: bold;">Verificación de Identidad (Video de 10s) *</label>
                <p style="font-size: 12px; color: var(--muted); margin: 0;">Presiona el botón, permite el acceso a tu cámara y graba un video corto presentándote.</p>
                <div style="display: flex; gap: 10px; align-items: center; margin-top: 8px;">
                  <button type="button" id="btn-record-video" style="background: #E64381; color: white; padding: 10px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; width: 100%;">📹 Grabar Video (10s)</button>
                </div>
                <div id="record-status" style="font-size: 12px; font-weight: bold; color: #4CAF50; text-align: center; margin-top: 4px;"></div>
                <video id="record-preview" style="display: none; width: 100%; border-radius: 8px; margin-top: 10px; border: 1px solid var(--line-bright);" autoplay muted playsinline></video>
                <input type="hidden" id="reg-video-url" required />
              </div>

              <button type="submit" id="btn-submit-reg" style="background: var(--coral); color: #fff; padding: 16px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; text-transform: uppercase; margin-top: 16px;">Enviar Postulación</button>
              <div id="reg-feedback" style="display: none; text-align: center; color: #4CAF50; font-weight: bold; padding: 10px;"></div>
            </form>
          </div>
        </div>
      </section>

      <section class="section" id="tutoriales">
        <div class="container" style="max-width: 800px; margin: 60px auto;">
          <div class="section-header" style="text-align: center; margin-bottom: 40px;">
            <div>
              <div class="kicker">05 · VIDEOTUTORIALES</div>
              <h2>Aprende con<br><span class="gradient-text">Nosotros.</span></h2>
            </div>
            <p class="section-desc">Recursos oficiales subidos desde el panel de administración.</p>
          </div>
          <div id="tutoriales-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px;">
            <!-- Renderizado dinámico -->
          </div>
        </div>
      </section>

      <section class="section" id="dudas">
        <div class="container" style="max-width: 800px; margin: 60px auto;">
          <div class="section-header" style="text-align: center; margin-bottom: 40px;">
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

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)

