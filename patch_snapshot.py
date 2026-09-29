import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Locate the onSnapshot block
insertion = """
          // Apply dynamic backgrounds
          if (data.bg1) {
            document.body.style.backgroundImage = `url(${data.bg1})`;
          }
          if (data.videoUrl) {
             const vidEl = document.getElementById("hero-video");
             if (vidEl) {
                vidEl.src = data.videoUrl;
                vidEl.load();
             }
          }
          if (data.textos) {
            const editableElements = document.querySelectorAll('.hero h1, .hero p, .accordion-header h3, .platform-item span, .footer-content p, .highlight');
            editableElements.forEach((el, index) => {
              if (data.textos['texto_' + index]) {
                el.innerHTML = data.textos['texto_' + index];
              }
            });
          }
"""

html = html.replace('if (Array.isArray(data.cards) && data.cards.length > 0) {', insertion + '\n        if (Array.isArray(data.cards) && data.cards.length > 0) {')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
