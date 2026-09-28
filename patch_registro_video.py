import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update the Accordion Header to include the video
old_header_regex = r'<div class="premium-accordion-header" id="toggle-registro">\s*<div style="pointer-events: none;">\s*<div class="kicker">04 · REGISTRO Y CONVOCATORIA</div>'

new_header = """<div class="premium-accordion-header" id="toggle-registro" style="position: relative; overflow: visible; display: flex; align-items: center; justify-content: space-between;">
            
            <!-- Personaje con fondo transparente o negro (usando mix-blend-mode screen para quitar fondo negro si lo tiene) -->
            <video id="registro-personaje-video" autoplay loop muted playsinline disablepictureinpicture style="position: absolute; right: -20px; bottom: -10px; height: 160%; z-index: 0; pointer-events: none; mix-blend-mode: screen; -webkit-mix-blend-mode: screen; object-fit: contain; opacity: 0.9;"></video>
            
            <div style="position: relative; z-index: 1; pointer-events: none;">
              <div class="kicker">04 · REGISTRO Y CONVOCATORIA</div>"""

content = re.sub(old_header_regex, new_header, content)


# 2. Add admin field for the video URL
admin_field = """
        <div style="margin-top:24px; padding-top: 16px; border-top: 1px solid var(--line);">
          <label class="admin-label">VIDEO PERSONAJE - REGISTRO (.webm transparente o MP4 fondo negro)</label>
          <input type="text" class="admin-input" id="admin-registro-video" placeholder="URL del video (ej. https://.../video.webm)" style="margin-bottom: 6px;" />
        </div>
"""
# Insert before Videotutoriales
content = content.replace('<div style="margin-top:24px; padding-top: 16px; border-top: 1px solid var(--line);">\n          <label class="admin-label">VIDEOTUTORIALES (ENLACES DE VIDEO O YOUTUBE)</label>', admin_field + '\n        <div style="margin-top:24px; padding-top: 16px; border-top: 1px solid var(--line);">\n          <label class="admin-label">VIDEOTUTORIALES (ENLACES DE VIDEO O YOUTUBE)</label>')


# 3. Handle JS Loading from Firestore
js_load = """          if (data.registroVideo !== undefined) {
            if (document.getElementById("admin-registro-video")) document.getElementById("admin-registro-video").value = data.registroVideo || "";
            if (document.getElementById("registro-personaje-video")) document.getElementById("registro-personaje-video").src = data.registroVideo || "";
          }
"""
content = content.replace('if (data.tutorials) {', js_load + '\n          if (data.tutorials) {')


# 4. Handle JS Saving to Firestore
js_save = """      const registroVideo = document.getElementById("admin-registro-video")?.value || "";
"""
content = content.replace('const tutorials = [', js_save + '\n      const tutorials = [')

# Update the JSON payload to include registroVideo
content = content.replace('{ theme: newTheme, cards: newCards, whatsapp, tutorials, layout }', '{ theme: newTheme, cards: newCards, whatsapp, tutorials, layout, registroVideo }')


with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)

