import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Delete Section 02 and 03
content = re.sub(r'<section id="actividad">[\s\S]*?</section>', '', content)
content = re.sub(r'<section id="universo">[\s\S]*?</section>', '', content)

# 2. Replace .planet with slideshow
planet_html = '<div class="planet"></div>'
slideshow_html = """<div class="slideshow-container">
              <div class="slide slide-1"></div>
              <div class="slide slide-2"></div>
              <div class="particles"></div>
            </div>"""
content = content.replace(planet_html, slideshow_html)

# 3. Add CSS for slideshow
planet_css_regex = r'\.planet\{[\s\S]*?@keyframes floatCard\{50%\{transform:translateY\(-10px\)\}\}'

new_css = """
    .slideshow-container {
      width: min(390px, 72vw);
      aspect-ratio: 1;
      position: relative;
      overflow: hidden;
      border-radius: 50%;
      box-shadow: inset -45px -30px 80px rgba(0,0,0,.75), 0 0 70px rgba(230,67,129,.16);
    }
    .slideshow-container::before {
      content: ""; position: absolute; inset: -22px;
      border: 1px solid rgba(235,82,121,.35);
      border-radius: 50%; transform: rotate(-22deg) scaleY(.27);
      box-shadow: 0 0 35px rgba(235,82,121,.18); pointer-events: none; z-index: 10;
    }
    .slide {
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      background-size: cover; background-position: center;
      opacity: 0; transition: opacity 2s ease-in-out;
    }
    .slide-1 {
      background-image: url('/bg1.png');
      animation: kenburns 14s infinite ease-in-out, fade1 14s infinite;
    }
    .slide-2 {
      background-image: url('/bg2.png');
      animation: kenburns 14s infinite ease-in-out reverse, fade2 14s infinite;
    }
    .particles {
      position: absolute; top: 0; left: 0; width: 200%; height: 200%;
      background-image: radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px);
      background-size: 25px 25px; opacity: 0.3;
      animation: moveParticles 30s linear infinite; pointer-events: none; z-index: 5;
    }
    @keyframes fade1 {
      0%, 40% { opacity: 1; }
      50%, 90% { opacity: 0; }
      100% { opacity: 1; }
    }
    @keyframes fade2 {
      0%, 40% { opacity: 0; }
      50%, 90% { opacity: 1; }
      100% { opacity: 0; }
    }
    @keyframes kenburns {
      0% { transform: scale(1) translate(0, 0); }
      100% { transform: scale(1.15) translate(2%, 2%); }
    }
    @keyframes moveParticles {
      0% { transform: translate(0, 0) scale(1); }
      100% { transform: translate(-10%, -10%) scale(1.1); }
    }

    .float-card{
      position:absolute;border:1px solid rgba(255,255,255,.13);background:rgba(15,12,20,.66);
      backdrop-filter:blur(18px);border-radius:18px;padding:15px 17px;box-shadow:var(--shadow);
      animation:floatCard 6s ease-in-out infinite; z-index: 20;
    }
    .float-card.small{right:4%;top:16%}.float-card.tiny{left:4%;bottom:18%;animation-delay:-3s}
    .fc-label{font-size:9px;letter-spacing:.15em;text-transform:uppercase;color:#8f8692}
    .fc-value{font-weight:800;font-size:15px;margin-top:5px}
    @keyframes floatCard{50%{transform:translateY(-10px)}}
"""

content = re.sub(planet_css_regex, new_css, content)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)

