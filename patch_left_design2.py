import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update left-panel HTML
old_html_regex = r'<!-- PANEL IZQUIERDO -->\s*<nav class="left-panel" id="left-panel">[\s\S]*?</nav>'
new_html = """<!-- PANEL IZQUIERDO (Diseño 2: Nodos) -->
  <nav class="left-panel" id="left-panel">
    <a href="#inicio" class="left-panel-item active" data-target="inicio">
      <svg class="icon"><use href="#icon-home"></use></svg>
      <span class="label">Inicio</span>
    </a>
    <a href="#formulario-registro" class="left-panel-item" data-target="formulario-registro">
      <svg class="icon"><use href="#icon-form"></use></svg>
      <span class="label">Formulario</span>
    </a>
    <a href="#tutoriales" class="left-panel-item" data-target="tutoriales">
      <svg class="icon"><use href="#icon-video"></use></svg>
      <span class="label">Tutoriales</span>
    </a>
    <a href="#dudas" class="left-panel-item" data-target="dudas">
      <svg class="icon"><use href="#icon-support"></use></svg>
      <span class="label">Soporte</span>
    </a>
  </nav>"""
content = re.sub(old_html_regex, new_html, content)

# 2. Update left-panel CSS
old_css_regex = r'/\* PANEL IZQUIERDO SCROLLSPY Y DESPLEGABLE \*/[\s\S]*?@media\(max-width:620px\)\{\s*\.left-panel \{\s*left: 5px;\s*\}\s*\.left-panel\.is-expanded \{\s*width: 120px;\s*background: rgba\(10, 8, 15, 0\.85\);\s*\/\* Solid enough for mobile \*\/\s*\}\s*\}'

new_css = """/* PANEL IZQUIERDO SCROLLSPY Y DESPLEGABLE - ESTILO 2 (Nodos de Cristal) */
    .left-panel {
      position: fixed; left: 20px; top: 50%; transform: translateY(-50%);
      width: 2px; height: 200px; background: rgba(255,255,255,0.1);
      display: flex; flex-direction: column; justify-content: space-evenly; align-items: center; z-index: 1000;
    }

    .left-panel-item {
      position: relative; width: 36px; height: 36px; background: #1a1525; border: 1px solid rgba(255,255,255,0.2);
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); color: rgba(255,255,255,0.6); text-decoration: none; cursor: pointer;
    }
    
    .left-panel-item svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2; }

    .left-panel-item .label {
      position: absolute; left: 45px; font-size: 11px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase;
      background: rgba(18, 15, 26, 0.95); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1);
      padding: 6px 12px; border-radius: 8px; opacity: 0; transform: translateX(-10px);
      transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); pointer-events: none; white-space: nowrap; color: #fff;
    }

    /* Active State (Scrollspy) */
    .left-panel-item.active {
      background: var(--fuchsia); color: #fff; border-color: var(--fuchsia); transform: scale(1.15); box-shadow: 0 0 15px rgba(230,67,129,0.5);
    }
    
    /* Expanded State (when panel has .is-expanded due to hover/scroll) */
    .left-panel.is-expanded .left-panel-item.active .label {
      opacity: 1; transform: translateX(0);
    }
    
    /* Hover on individual items */
    .left-panel-item:hover {
      background: var(--coral); color: #fff; border-color: var(--coral); transform: scale(1.15);
    }
    .left-panel-item:hover .label {
      opacity: 1; transform: translateX(0);
    }

    @media(max-width:620px){
      .left-panel { left: 10px; }
      .left-panel-item .label {
         background: rgba(10, 8, 15, 0.95); /* Solid on mobile */
      }
    }"""
content = re.sub(old_css_regex, new_css, content)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)

