import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Remove obsolete fields: Título Tarjeta Principal, Descripción Tarjeta Principal, Color de Acento Primario
obsolete_fields = r"""        <div class="admin-field">\s*<label>Color de Acento Primario:</label>\s*<input type="color" id="editor-theme-color"[^>]*>\s*</div>\s*</div>\s*<div class="admin-field">\s*<label>Título Tarjeta Principal:</label>\s*<input type="text" class="admin-input" id="editor-c1-title"[^>]*>\s*</div>\s*<div class="admin-field">\s*<label>Descripción Tarjeta Principal:</label>\s*<input type="text" class="admin-input" id="editor-c1-desc"[^>]*>\s*</div>"""
html = re.sub(obsolete_fields, "", html, flags=re.DOTALL)

# 2. Change Video Personaje - Registro from a text input to a File Upload button
old_vid_reg = r"""        <div style="margin-top:24px; padding-top: 16px; border-top: 1px solid var\(--line\);">\s*<label class="admin-label">VIDEO PERSONAJE - REGISTRO \(\.webm transparente o MP4 fondo negro\)</label>\s*<input type="text" class="admin-input" id="admin-registro-video" placeholder="URL del video[^>]*>\s*</div>"""
new_vid_reg = """        <div style="margin-top:24px; padding-top: 16px; border-top: 1px solid var(--line);">
          <label class="admin-label">VIDEO PERSONAJE - REGISTRO (.webm transparente o MP4 fondo negro)</label>
          <label style="background:var(--pink);color:#fff;padding:8px;border-radius:4px;display:block;margin-bottom:6px;cursor:pointer;font-weight:bold;text-align:center;">
            SUBIR VIDEO DE REGISTRO
            <input type="file" id="admin-registro-video-file" accept="video/webm,video/mp4" style="display:none;" />
          </label>
        </div>"""
html = re.sub(old_vid_reg, new_vid_reg, html, flags=re.DOTALL)

# 3. Unhide the Save Button and remove duplicate style
old_save_btn = r"""<button type="button" class="btn btn-primary" id="btn-save-firestore" style="display:none;" style="width:100%;justify-content:center;margin-top:14px;">"""
new_save_btn = """<button type="button" class="btn btn-primary" id="btn-save-firestore" style="width:100%;justify-content:center;margin-top:14px;background:#4CAF50;border:none;">"""
html = html.replace(old_save_btn, new_save_btn)

# 4. Remove 'newTheme' and 'newCards' from the save logic since they're obsolete
old_save_logic = r"""      const newTheme = \{ primary: document.getElementById\("editor-theme-color"\)\.value \};\s*const newCards = \[\s*\{\s*id: "card-streamer",\s*title: document.getElementById\("editor-c1-title"\)\.value,\s*subtitle: document.getElementById\("editor-c1-desc"\)\.value,\s*badge: "LIVE HUB",\s*link: "#formulario-registro",\s*videoUrl: "/leonsito.webm"\s*\}\s*\];"""
html = re.sub(old_save_logic, "", html, flags=re.DOTALL)

# Also remove them from setDoc
old_setDoc = r"""await setDoc\(stateDocRef, \{\s*layout,\s*theme: newTheme,\s*cards: newCards,\s*whatsapp,\s*registroVideo,\s*tutorials\s*\}, \{ merge: true \}\);"""
new_setDoc = """await setDoc(stateDocRef, { layout, whatsapp }, { merge: true });"""
html = re.sub(old_setDoc, new_setDoc, html, flags=re.DOTALL)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
