import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Inject slider UI in Admin Panel
slider_html = """
        <div class="admin-field" style="margin-top: 16px;">
          <label>Escala de las 3 Tarjetas (1x):</label>
          <input type="range" id="admin-card-scale" min="0.5" max="1.5" step="0.05" value="1" style="width:100%;">
          <span id="val-card-scale" style="font-size: 11px; color: var(--muted);">1</span>
        </div>
        <div class="admin-field">
          <label>Escala del Video (1x):</label>
          <input type="range" id="admin-video-scale" min="0.5" max="2.5" step="0.05" value="1" style="width:100%;">
          <span id="val-video-scale" style="font-size: 11px; color: var(--muted);">1</span>
        </div>
        <div class="admin-field">
          <label>Posición X del Video (Horizontal px):</label>
          <input type="range" id="admin-video-x" min="-200" max="200" step="1" value="0" style="width:100%;">
          <span id="val-video-x" style="font-size: 11px; color: var(--muted);">0px</span>
        </div>
        <div class="admin-field">
          <label>Posición Y del Video (Vertical px):</label>
          <input type="range" id="admin-video-y" min="-200" max="200" step="1" value="0" style="width:100%;">
          <span id="val-video-y" style="font-size: 11px; color: var(--muted);">0px</span>
        </div>
"""

# Insert right before Color de Acento Primario
target_color = '<div class="admin-field">\n          <label>Color de Acento Primario:</label>'
if target_color in content:
    content = content.replace(target_color, slider_html + "\n        " + target_color)
else:
    target_color2 = '<div class="admin-field">\n          <label>Color de Acento Primario'
    content = content.replace(target_color2, slider_html + "\n        " + target_color2)

# 2. Add CSS rules to use the variables
# For the video, we can modify the inline style in renderCards
render_cards_old = 'style="position: absolute; width: 80%; height: 80%; z-index: 2; object-fit: contain; pointer-events: none;"'
render_cards_new = 'style="position: absolute; width: 80%; height: 80%; z-index: 2; object-fit: contain; pointer-events: none; transform: translate(var(--video-x, 0px), var(--video-y, 0px)) scale(var(--video-scale, 1));"'
content = content.replace(render_cards_old, render_cards_new)

# For the cards container, we modify .cards definition
cards_old = '.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}'
cards_new = '.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:18px; transform: scale(var(--card-scale, 1)); transform-origin: top center; transition: transform 0.2s ease;}'
content = content.replace(cards_old, cards_new)

# 3. Add logic to sync onSnapshot
sync_regex = r'(if \(data\.cards\[2\]\) \{[^\}]+\})'
new_sync_logic = r"""\1
          if (data.layout) {
            document.documentElement.style.setProperty("--card-scale", data.layout.cardScale || 1);
            document.documentElement.style.setProperty("--video-scale", data.layout.videoScale || 1);
            document.documentElement.style.setProperty("--video-x", (data.layout.videoX || 0) + "px");
            document.documentElement.style.setProperty("--video-y", (data.layout.videoY || 0) + "px");

            if(document.getElementById("admin-card-scale")) {
              document.getElementById("admin-card-scale").value = data.layout.cardScale || 1;
              document.getElementById("admin-video-scale").value = data.layout.videoScale || 1;
              document.getElementById("admin-video-x").value = data.layout.videoX || 0;
              document.getElementById("admin-video-y").value = data.layout.videoY || 0;
              
              document.getElementById("val-card-scale").textContent = data.layout.cardScale || 1;
              document.getElementById("val-video-scale").textContent = data.layout.videoScale || 1;
              document.getElementById("val-video-x").textContent = (data.layout.videoX || 0) + "px";
              document.getElementById("val-video-y").textContent = (data.layout.videoY || 0) + "px";
            }
          }"""
content = re.sub(sync_regex, new_sync_logic, content, count=1)

# 4. Add logic to Save and preview real-time slider changes
save_regex = r'(const newTheme = \{ primary: document\.getElementById\("editor-theme-color"\)\.value \};)'
new_save_logic = r"""const layout = {
        cardScale: parseFloat(document.getElementById("admin-card-scale")?.value || 1),
        videoScale: parseFloat(document.getElementById("admin-video-scale")?.value || 1),
        videoX: parseInt(document.getElementById("admin-video-x")?.value || 0),
        videoY: parseInt(document.getElementById("admin-video-y")?.value || 0)
      };
      \1"""
content = re.sub(save_regex, new_save_logic, content, count=1)

state_clean = r'({ theme: newTheme, cards: newCards, whatsapp, tutorials })'
content = content.replace(state_clean, '{ theme: newTheme, cards: newCards, whatsapp, tutorials, layout }')

# 5. Add event listeners for sliders so they update variables instantly for preview
script_end = r'(// === VIDEO RECORDER HANDLER ===)'
preview_script = r"""
    const inputs = ["card-scale", "video-scale", "video-x", "video-y"];
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
    \1"""
content = re.sub(script_end, preview_script, content, count=1)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)

