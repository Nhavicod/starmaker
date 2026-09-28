import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

admin_html_to_inject = """
        <div style="margin-top:24px; padding-top: 16px; border-top: 1px solid var(--line);">
          <label class="admin-label">BASE DE DATOS (EXCEL)</label>
          <button type="button" id="btn-download-db" class="admin-input" style="background: #4CAF50; color: white; border:none; cursor: pointer; text-transform: uppercase; font-weight: bold; width: 100%; margin-bottom: 12px;">Descargar DATABASE (.CSV / Excel)</button>
        </div>

        <div style="margin-top:24px; padding-top: 16px; border-top: 1px solid var(--line);">
          <label class="admin-label">ENLACES DE SOPORTE (WHATSAPP)</label>
          <input type="text" class="admin-input" id="admin-wa-1" placeholder="Opción 1: https://wa.me/..." style="margin-bottom: 6px;" />
          <input type="text" class="admin-input" id="admin-wa-2" placeholder="Opción 2: https://wa.me/..." style="margin-bottom: 6px;" />
          <input type="text" class="admin-input" id="admin-wa-3" placeholder="Opción 3: https://wa.me/..." style="margin-bottom: 6px;" />
        </div>

        <div style="margin-top:24px; padding-top: 16px; border-top: 1px solid var(--line);">
          <label class="admin-label">VIDEOTUTORIALES (ENLACES DE VIDEO O YOUTUBE)</label>
          <input type="text" class="admin-input" id="admin-tut-1" placeholder="URL Video 1" style="margin-bottom: 6px;" />
          <input type="text" class="admin-input" id="admin-tut-2" placeholder="URL Video 2" style="margin-bottom: 6px;" />
          <input type="text" class="admin-input" id="admin-tut-3" placeholder="URL Video 3" style="margin-bottom: 6px;" />
        </div>
"""

# Replace just before the GUARDAR button
target_string = '<button type="button" class="btn btn-primary" id="btn-save-firestore"'
content = content.replace(target_string, admin_html_to_inject + "\n        " + target_string)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)
