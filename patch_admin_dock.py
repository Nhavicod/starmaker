import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# 1. CSS changes
old_dock_css = r'/\* SIDE DOCK ESTILO IPHONE VOLUMEN \*/[\s\S]*?\.side-dock\.is-scrolling \{[^}]*\}[\s\S]*?\.side-dock\.is-scrolling \.side-dock-item \{[^}]*\}[\s\S]*?\.side-dock-item:hover \{[^}]*\}'
# Actually, it's safer to just find "/* SIDE DOCK ESTILO IPHONE VOLUMEN */" to the end of the block, 
# but let's just insert the new CSS and we'll remove the old one.
content = re.sub(r'/\* SIDE DOCK ESTILO IPHONE VOLUMEN \*/[\s\S]*?\.side-dock-item:hover \{[^}]*\}', '', content)

new_dock_css = """
    /* SVG Utilities */
    .icon { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    
    /* SIDE DOCK BASE */
    .side-dock-container {
      position: fixed; right: 0; top: 50%; transform: translateY(-50%); z-index: 1000;
      /* Hit area */ padding-left: 50px; padding-top: 50px; padding-bottom: 50px;
    }
    .side-dock {
      position: relative; display: flex; flex-direction: column; justify-content: space-evenly; transition: 0.4s;
    }
    .side-dock a {
      position: absolute; right: 15px; display: flex; align-items: center; gap: 10px; font-size: 11px; font-weight: bold;
      opacity: 0; transform: translateX(20px); transition: 0.4s; pointer-events: none;
    }
    .side-dock.is-active a { opacity: 1; transform: translateX(0); pointer-events: auto; }
    .side-dock a:nth-child(1) { top: 10%; transition-delay: 0s; }
    .side-dock a:nth-child(2) { top: 35%; transition-delay: 0.05s; }
    .side-dock a:nth-child(3) { top: 60%; transition-delay: 0.1s; }
    .side-dock a:nth-child(4) { top: 85%; transition-delay: 0.15s; }

    /* ESTILO 1: Cristal Original */
    .side-dock.style-1 { width: 2px; height: 180px; background: rgba(255,255,255,0.2); right: 0; }
    .side-dock.style-1.is-active { background: rgba(255,255,255,0.5); width: 4px; }
    .side-dock.style-1 a {
      background: rgba(255,255,255,0.05); padding: 8px 12px; border-radius: 12px; backdrop-filter: blur(10px);
    }
    .side-dock.style-1 a:hover { background: var(--fuchsia); color: #fff; }

    /* ESTILO 5: Cajones Cyberpunk */
    .side-dock.style-5 { width: 3px; height: 180px; background: linear-gradient(to bottom, var(--coral), var(--fuchsia)); right: 0; }
    .side-dock.style-5 a {
      right: 10px; background: rgba(10,5,15,0.9); border: 1px solid rgba(255,255,255,0.1);
      padding: 8px; border-radius: 8px 0 0 8px; transform: translateX(100%); opacity: 0;
    }
    .side-dock.style-5.is-active a { transform: translateX(0); opacity: 1; }
    .side-dock.style-5 a:hover { background: rgba(230,67,129,0.2); border-color: var(--fuchsia); color: #fff; }
"""
content = content.replace("</style>", new_dock_css + "\n</style>", 1)

# 2. HTML changes
old_html_regex = r'<div class="side-dock-container">[\s\S]*?</div>\s*</div>'
new_html = """
  <!-- SVG Icons Template -->
  <svg style="display:none;">
    <defs>
      <g id="icon-home"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></g>
      <g id="icon-form"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></g>
      <g id="icon-video"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></g>
      <g id="icon-support"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></g>
    </defs>
  </svg>

  <div class="side-dock-container">
    <div class="side-dock style-1" id="side-dock">
      <a href="#inicio"><svg class="icon"><use href="#icon-home"></use></svg> <span>Inicio</span></a>
      <a href="#formulario-registro"><svg class="icon"><use href="#icon-form"></use></svg> <span>Formulario</span></a>
      <a href="#tutoriales"><svg class="icon"><use href="#icon-video"></use></svg> <span>Tutoriales</span></a>
      <a href="#dudas"><svg class="icon"><use href="#icon-support"></use></svg> <span>Soporte</span></a>
    </div>
  </div>
"""
content = re.sub(old_html_regex, new_html, content)

# 3. Add to admin panel
admin_field = """
        <div class="admin-field">
          <label>Estilo del Dock (Menú Lateral):</label>
          <select id="admin-dock-style" class="admin-input">
            <option value="style-1">Diseño 1: Cristal Original</option>
            <option value="style-5">Diseño 5: Cajones Cyberpunk</option>
          </select>
        </div>
"""
content = content.replace('<div class="admin-field">\n          <label>Escala del Video (1x):</label>', admin_field + '\n        <div class="admin-field">\n          <label>Escala del Video (1x):</label>')

# 4. Javascript logic
js_save = """
      const layout = {
        dockStyle: document.getElementById("admin-dock-style")?.value || "style-1",
"""
content = content.replace("const layout = {", js_save)

js_load = """
          if (data.layout) {
            if (data.layout.dockStyle) {
              const dock = document.getElementById("side-dock");
              if (dock) {
                dock.className = "side-dock " + data.layout.dockStyle;
              }
              const dockSelect = document.getElementById("admin-dock-style");
              if (dockSelect) dockSelect.value = data.layout.dockStyle;
            }
"""
content = content.replace("if (data.layout) {", js_load)

# 5. Fix Javascript Hover Class (is-active instead of is-scrolling)
content = content.replace("classList.add('is-scrolling')", "classList.add('is-active')")
content = content.replace("classList.remove('is-scrolling')", "classList.remove('is-active')")

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)
