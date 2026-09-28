import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# Replace the links in side-dock
content = content.replace('<a href="#experiencias" class="side-dock-item">Experiencias</a>', '<a href="#inicio" class="side-dock-item">Inicio</a>')

# Let's improve the hit area
css_replace_from = """    .side-dock-container {
      position: fixed;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      z-index: 1000;
      display: flex;
      align-items: center;
      padding-right: 12px;
      height: 300px;
    }"""
css_replace_to = """    .side-dock-container {
      position: fixed;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      z-index: 1000;
      display: flex;
      align-items: center;
      padding-right: 12px;
      padding-left: 50px; /* larger hit area */
      height: 300px;
    }"""
content = content.replace(css_replace_from, css_replace_to)

# Change hover logic to use container
script_replace_from = """      sideDock.addEventListener('mouseenter', () => {
        sideDock.classList.add('is-scrolling');
        clearTimeout(scrollTimeout);
      });

      sideDock.addEventListener('mouseleave', () => {
        scrollTimeout = setTimeout(() => {
          sideDock.classList.remove('is-scrolling');
        }, 2000);
      });"""

script_replace_to = """      const dockContainer = document.querySelector('.side-dock-container');
      dockContainer.addEventListener('mouseenter', () => {
        sideDock.classList.add('is-scrolling');
        clearTimeout(scrollTimeout);
      });

      dockContainer.addEventListener('mouseleave', () => {
        scrollTimeout = setTimeout(() => {
          sideDock.classList.remove('is-scrolling');
        }, 2000);
      });"""
content = content.replace(script_replace_from, script_replace_to)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)

