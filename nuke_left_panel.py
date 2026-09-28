import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# Nuke all CSS that has .left-panel
content = re.sub(r'/\* PANEL IZQUIERDO.*?\*/[\s\S]*?@media\(max-width:620px\)\{[\s\S]*?\}', '', content)
# To be safe, just remove any line with .left-panel
lines = content.split('\n')
lines = [l for l in lines if '.left-panel' not in l]
content = '\n'.join(lines)

# Nuke HTML left panel completely. Since we know it has left-panel-item, we can just delete those lines.
# But what about the container? <div class="left-panel"> or <nav class="left-panel" id="left-panel">
# The list comprehension above deleted lines containing '.left-panel', which handles the CSS.
# Wait, for HTML: <div class="left-panel"> might be matched and deleted, but the closing </div> would be left dangling!

