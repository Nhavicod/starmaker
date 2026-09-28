import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Remove the Card Scale slider from HTML
slider_regex = r'<div class="admin-field" style="margin-top: 16px;">\s*<label>Escala de las 3 Tarjetas \(1x\):</label>\s*<input type="range" id="admin-card-scale" min="0\.5" max="1\.5" step="0\.05" value="1" style="width:100%;">\s*<span id="val-card-scale" style="font-size: 11px; color: var\(--muted\);">1</span>\s*</div>'
content = re.sub(slider_regex, '', content)

# 2. Revert the .cards CSS
cards_css = r'\.cards\{display:grid;grid-template-columns:repeat\(3,1fr\);gap:18px; transform: scale\(var\(--card-scale, 1\)\); transform-origin: top center; transition: transform 0\.2s ease;\}'
cards_old = '.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}'
content = re.sub(cards_css, cards_old, content)

# 3. Remove from JS logic
# It's fine if the property is still in layout (it will just be ignored), but we should remove the DOM manipulations to avoid null errors.
content = content.replace('document.documentElement.style.setProperty("--card-scale", data.layout.cardScale || 1);', '')
content = content.replace('document.getElementById("admin-card-scale").value = data.layout.cardScale || 1;', '')
content = content.replace('document.getElementById("val-card-scale").textContent = data.layout.cardScale || 1;', '')
content = content.replace('cardScale: parseFloat(document.getElementById("admin-card-scale")?.value || 1),', '')

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)
