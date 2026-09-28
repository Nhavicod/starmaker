import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Remove side dock HTML
side_dock_html_regex = r'<div class="side-dock-container">[\s\S]*?</div>\s*</div>'
content = re.sub(side_dock_html_regex, '', content)

# 2. Remove side dock CSS
# The CSS starts with /* SVG Utilities */ and goes to the end of .side-dock.style-5 a:hover
side_dock_css_regex = r'/\* SVG Utilities \*/[\s\S]*?\.side-dock\.style-5 a:hover \{[^}]*\}'
content = re.sub(side_dock_css_regex, '', content)

# 3. Remove admin style selector
admin_style_regex = r'<div class="admin-field">\s*<label>Estilo del Dock \(Menú Lateral\):</label>[\s\S]*?</select>\s*</div>'
content = re.sub(admin_style_regex, '', content)

# Remove the JS layout dockStyle load/save
js_save_regex = r'dockStyle: document\.getElementById\("admin-dock-style"\)\?\.value \|\| "style-1",'
content = re.sub(js_save_regex, '', content)

js_load_regex = r'if \(data\.layout\.dockStyle\) \{[\s\S]*?\}'
content = re.sub(js_load_regex, '', content)


# 4. Replace .left-panel HTML
old_left_panel_regex = r'<!-- PANEL IZQUIERDO -->\s*<div class="left-panel">[\s\S]*?</div>'

new_left_panel = """<!-- PANEL IZQUIERDO -->
  <nav class="left-panel" id="left-panel">
    <a href="#inicio" class="left-panel-item active" data-target="inicio">
      <span class="indicator"></span><span class="label">Inicio</span>
    </a>
    <a href="#formulario-registro" class="left-panel-item" data-target="formulario-registro">
      <span class="indicator"></span><span class="label">Formulario</span>
    </a>
    <a href="#tutoriales" class="left-panel-item" data-target="tutoriales">
      <span class="indicator"></span><span class="label">Tutoriales</span>
    </a>
    <a href="#dudas" class="left-panel-item" data-target="dudas">
      <span class="indicator"></span><span class="label">Soporte</span>
    </a>
  </nav>"""
content = re.sub(old_left_panel_regex, new_left_panel, content)


# 5. Replace .left-panel CSS
old_left_panel_css_regex = r'/\* PANEL IZQUIERDO SCROLLSPY \*/[\s\S]*?@media\(max-width:900px\)\{\s*\.left-panel \{ display: none; \}\s*\}'

new_left_panel_css = """/* PANEL IZQUIERDO SCROLLSPY Y DESPLEGABLE */
    .left-panel {
      position: fixed;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 20px 10px;
      border-radius: 16px;
      transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
      /* Compact state */
      width: 15px;
      background: transparent;
      backdrop-filter: blur(0px);
      -webkit-backdrop-filter: blur(0px);
      border: 1px solid transparent;
      overflow: hidden;
      align-items: flex-start;
    }
    
    /* Expanded state (hover, touch, scroll) */
    .left-panel.is-expanded {
      width: 130px;
      background: rgba(18, 15, 26, 0.6);
      backdrop-filter: blur(15px);
      -webkit-backdrop-filter: blur(15px);
      border: 1px solid rgba(255,255,255,0.1);
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }

    .left-panel-item {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: var(--dim);
      transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
      width: 100%;
      cursor: pointer;
    }
    
    .indicator {
      flex-shrink: 0;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: rgba(255,255,255,0.3);
      transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
    }
    
    .label {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      opacity: 0;
      transform: translateX(-10px);
      transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
      white-space: nowrap;
    }

    /* Active state */
    .left-panel-item.active {
      color: #fff;
    }
    
    .left-panel-item.active .indicator {
      width: 4px;
      height: 20px;
      border-radius: 4px;
      background: var(--fuchsia);
      box-shadow: 0 0 10px rgba(230,67,129,0.8);
    }
    
    .left-panel.is-expanded .label {
      opacity: 1;
      transform: translateX(0);
    }
    
    .left-panel.is-expanded .left-panel-item:hover {
      color: var(--coral);
    }

    @media(max-width:620px){
      .left-panel {
        left: 5px;
      }
      .left-panel.is-expanded {
        width: 120px;
        background: rgba(10, 8, 15, 0.85); /* Solid enough for mobile */
      }
    }
"""
content = re.sub(old_left_panel_css_regex, new_left_panel_css, content)

# 6. Replace Left Panel JS logic to handle hover/scroll expansion
old_js_regex = r'<script>\s*const sections = document\.querySelectorAll\(\'section\[id\]\'\);[\s\S]*?window\.addEventListener\(\'load\', updateActiveSection\);\s*</script>'

new_js = """<script>
    const sections = document.querySelectorAll('section[id]');
    const leftPanelItems = document.querySelectorAll('.left-panel-item');
    const leftPanel = document.getElementById('left-panel');
    let expandTimeout;

    function updateActiveSection() {
      let current = 'inicio';
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= (sectionTop - window.innerHeight / 2)) {
          current = section.getAttribute('id');
        }
      });

      leftPanelItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-target') === current) {
          item.classList.add('active');
        }
      });
    }

    function expandPanel() {
      leftPanel.classList.add('is-expanded');
      clearTimeout(expandTimeout);
    }

    function collapsePanelDelayed() {
      expandTimeout = setTimeout(() => {
        if (!leftPanel.matches(':hover')) {
          leftPanel.classList.remove('is-expanded');
        }
      }, 2000);
    }

    // ScrollSpy
    window.addEventListener('scroll', () => {
      updateActiveSection();
      expandPanel();
      collapsePanelDelayed();
    });
    window.addEventListener('load', updateActiveSection);

    // Mouse / Touch
    leftPanel.addEventListener('mouseenter', expandPanel);
    leftPanel.addEventListener('mouseleave', collapsePanelDelayed);
    leftPanel.addEventListener('touchstart', expandPanel, {passive: true});
  </script>"""

content = re.sub(old_js_regex, new_js, content)

# Write back
with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)

