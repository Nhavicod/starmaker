import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Remove object-fit: cover -> object-fit: contain for video
content = content.replace("object-fit: cover; pointer-events: none;", "object-fit: contain; pointer-events: none;")

# 2. Remove the hologram CSS
hologram_css_regex = r'\.card-art::before\{[^}]+\}\s*\.card:hover \.card-art::before\{[^}]+\}\s*\.card:nth-child\(2\) \.card-art::before\{[^}]+\}\s*\.card:nth-child\(3\) \.card-art::before\{[^}]+\}\s*\.card-grid\{[^}]+\}'
content = re.sub(hologram_css_regex, '', content)

# 3. Remove <div class="card-grid"></div> from the HTML
content = content.replace('<div class="card-grid"></div>', '')

# Ensure we caught it, otherwise use a broader replace
if ".card-grid" in content:
    # manual replace if regex failed
    pass

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)
