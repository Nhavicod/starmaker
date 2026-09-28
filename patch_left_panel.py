with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add Left Panel CSS
left_panel_css = """
    /* PANEL IZQUIERDO SCROLLSPY */
    .left-panel {
      position: fixed;
      left: 32px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 16px;
      pointer-events: none;
    }
    
    .left-panel-item {
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--dim);
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
      opacity: 0.4;
    }
    
    .left-panel-item::before {
      content: "";
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: var(--dim);
      transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    .left-panel-item.active {
      color: #fff;
      opacity: 1;
      transform: translateX(8px);
    }
    
    .left-panel-item.active::before {
      width: 6px;
      height: 24px;
      border-radius: 4px;
      background: var(--fuchsia);
      box-shadow: 0 0 15px rgba(230,67,129,0.6);
    }
    
    @media(max-width:900px){
      .left-panel { display: none; }
    }
"""

content = content.replace("</style>", left_panel_css + "\n</style>", 1)

# 2. Add Left Panel HTML
left_panel_html = """
  <!-- PANEL IZQUIERDO -->
  <div class="left-panel">
    <div class="left-panel-item active" data-target="inicio">Inicio</div>
    <div class="left-panel-item" data-target="formulario-registro">Formulario</div>
    <div class="left-panel-item" data-target="tutoriales">Videotutoriales</div>
    <div class="left-panel-item" data-target="dudas">Soporte</div>
  </div>
"""

# Insert right after <div class="shell">
content = content.replace('<div class="shell">', '<div class="shell">\n' + left_panel_html)

# 3. Add Left Panel JS Scrollspy
left_panel_js = """
  <script>
    const sections = document.querySelectorAll('section[id]');
    const leftPanelItems = document.querySelectorAll('.left-panel-item');

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

    window.addEventListener('scroll', updateActiveSection);
    window.addEventListener('load', updateActiveSection);
  </script>
"""

content = content.replace("</body>", left_panel_js + "\n</body>")

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)

