import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Modify the .nav css
nav_css_regex = r'\.nav\{\s*position:fixed;top:18px;left:50%;transform:translateX\(-50%\);\s*width:min\(1160px,calc\(100% - 32px\)\);height:68px;\s*display:flex;align-items:center;justify-content:space-between;\s*padding:0 18px 0 22px;border:1px solid var\(--line\);\s*background:rgba\(7,7,10,\.65\);backdrop-filter:blur\(22px\);-webkit-backdrop-filter:blur\(22px\);\s*border-radius:22px;box-shadow:0 14px 45px rgba\(0,0,0,\.32\);\s*z-index:100;\s*\}'

new_nav_css = """    .nav{
      position:fixed;top:18px;left:50%;transform:translateX(-50%);
      width:min(1160px,calc(100% - 32px));height:68px;
      display:flex;align-items:center;justify-content:space-between;
      padding:0 18px 0 22px;
      z-index:100;
      pointer-events: none;
    }
    .brand, .nav-actions { pointer-events: auto; }
"""
content = re.sub(nav_css_regex, new_nav_css, content)

# 2. Hide .nav-links and .nav-cta, Add Side Dock CSS
side_dock_css = """
    .nav-links { display: none !important; }
    .nav-cta { display: none !important; }

    /* SIDE DOCK ESTILO IPHONE VOLUMEN */
    .side-dock-container {
      position: fixed;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      z-index: 1000;
      display: flex;
      align-items: center;
      padding-right: 12px;
      height: 300px;
    }
    .side-dock {
      background: rgba(18, 15, 26, 0.4);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 12px;
      padding: 16px 0;
      width: 6px;
      opacity: 0.3;
      overflow: hidden;
      transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
      transform-origin: right center;
    }
    .side-dock.is-scrolling {
      width: 150px;
      opacity: 1;
      padding: 16px 12px;
      background: rgba(18, 15, 26, 0.85);
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    }
    
    .side-dock-item {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px 10px;
      border-radius: 12px;
      color: var(--muted);
      font-size: 12px;
      font-weight: 700;
      text-decoration: none;
      background: rgba(255,255,255,0.03);
      border: 1px solid transparent;
      transition: all 0.3s ease;
      white-space: nowrap;
      opacity: 0;
      transform: translateX(20px);
      pointer-events: none;
    }
    .side-dock.is-scrolling .side-dock-item {
      opacity: 1;
      transform: translateX(0);
      pointer-events: auto;
    }
    
    .side-dock.is-scrolling .side-dock-item:nth-child(1) { transition-delay: 0.1s; }
    .side-dock.is-scrolling .side-dock-item:nth-child(2) { transition-delay: 0.15s; }
    .side-dock.is-scrolling .side-dock-item:nth-child(3) { transition-delay: 0.2s; }
    .side-dock.is-scrolling .side-dock-item:nth-child(4) { transition-delay: 0.25s; }

    .side-dock-item:hover {
      background: rgba(230,67,129,.15);
      border-color: rgba(230,67,129,.3);
      color: #fff;
    }
"""

if "/* SIDE DOCK" not in content:
    content = content.replace("</style>", side_dock_css + "</style>")

# 3. Insert the Side Dock HTML
side_dock_html = """
  <div class="side-dock-container">
    <div class="side-dock" id="side-dock">
      <a href="#experiencias" class="side-dock-item">Experiencias</a>
      <a href="#formulario-registro" class="side-dock-item">Formulario</a>
      <a href="#tutoriales" class="side-dock-item">Videotutoriales</a>
      <a href="#dudas" class="side-dock-item">Soporte</a>
    </div>
  </div>

  <script>
    let scrollTimeout;
    const sideDock = document.getElementById('side-dock');
    if (sideDock) {
      window.addEventListener('scroll', () => {
        sideDock.classList.add('is-scrolling');
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          if (!sideDock.matches(':hover')) {
            sideDock.classList.remove('is-scrolling');
          }
        }, 2000);
      });

      sideDock.addEventListener('mouseenter', () => {
        sideDock.classList.add('is-scrolling');
        clearTimeout(scrollTimeout);
      });

      sideDock.addEventListener('mouseleave', () => {
        scrollTimeout = setTimeout(() => {
          sideDock.classList.remove('is-scrolling');
        }, 2000);
      });
    }
  </script>
"""

if 'id="side-dock"' not in content:
    content = content.replace("</body>", side_dock_html + "\n</body>")

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)

