import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Fix the videoUrl query
html = html.replace('const vidEl = document.getElementById("hero-video");', '')
html = html.replace('if (vidEl) {', 'document.querySelectorAll(".hero-mascot-video").forEach(vidEl => {')
html = html.replace('vidEl.src = data.videoUrl;\n                vidEl.load();\n             }', 'vidEl.src = data.videoUrl;\n                vidEl.load();\n             });')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
