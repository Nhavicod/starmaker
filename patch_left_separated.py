import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# The previous HTML had icons:
#   <nav class="left-panel" id="left-panel">
#     <a href="#inicio" class="left-panel-item active" data-target="inicio">
#       <svg class="icon"><use href="#icon-home"></use></svg>
#       <span class="label">Inicio</span>
#     </a> ...
# This structure is already correct for the new separated capsules!
# So we only need to change the CSS of .left-panel.

old_css_regex = r'/\* PANEL IZQUIERDO SCROLLSPY Y DESPLEGABLE - ESTILO 2 \(Nodos de Cristal\) \*/[\s\S]*?@media\(max-width:620px\)\{\s*\.left-panel \{ left: 10px; \}\s*\.left-panel-item \.label \{\s*background: rgba\(10, 8, 15, 0\.95\);\s*/\* Solid on mobile \*/\s*\}\s*\}'

new_css = """/* PANEL IZQUIERDO SCROLLSPY Y DESPLEGABLE - BURBUJAS SEPARADAS */
    .left-panel {
      position: fixed; left: 15px; top: 50%; transform: translateY(-50%);
      display: flex; flex-direction: column; gap: 14px; z-index: 1000;
      pointer-events: none; /* Let clicks pass through gaps */
    }

    .left-panel-item {
      position: relative; width: 44px; height: 44px; border-radius: 22px;
      background: rgba(18, 15, 26, 0.4); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.08);
      display: flex; align-items: center; padding: 0 11px;
      transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
      overflow: hidden; text-decoration: none; color: rgba(255,255,255,0.5);
      cursor: pointer; pointer-events: auto;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }
    
    .left-panel-item svg { width: 18px; height: 18px; flex-shrink: 0; margin-left: 1px; transition: color 0.3s; }
    
    .left-panel-item .label {
      margin-left: 14px; font-size: 11px; font-weight: 800; letter-spacing: 0.1em;
      text-transform: uppercase; white-space: nowrap; opacity: 0; transition: opacity 0.3s;
    }

    /* Estado expandido (Controlado por JS) */
    .left-panel.is-expanded .left-panel-item {
      width: 165px;
      background: rgba(18, 15, 26, 0.85);
      border-color: rgba(255,255,255,0.15);
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .left-panel.is-expanded .left-panel-item .label {
      opacity: 1;
    }

    /* Active State (Scrollspy) */
    .left-panel-item.active {
      color: #fff;
      border-color: var(--fuchsia);
      background: rgba(230,67,129,0.15);
      box-shadow: 0 0 20px rgba(230,67,129,0.4);
    }
    .left-panel-item.active svg { color: var(--fuchsia); }
    
    /* Hover en item individual cuando está expandido */
    .left-panel.is-expanded .left-panel-item:hover {
      background: var(--coral);
      border-color: var(--coral);
      color: #fff;
    }
    .left-panel.is-expanded .left-panel-item:hover svg { color: #fff; }

    @media(max-width:620px){
      .left-panel { left: 8px; gap: 10px; }
      .left-panel-item { width: 38px; height: 38px; padding: 0 9px; }
      .left-panel.is-expanded .left-panel-item {
        width: 145px;
        background: rgba(10, 8, 15, 0.95); /* Solid on mobile */
      }
      .left-panel-item svg { width: 16px; height: 16px; }
    }"""

content = re.sub(old_css_regex, new_css, content)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)

