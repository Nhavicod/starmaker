export function renderHeader(currentPath = "#/") {
  const header = document.createElement("header");
  header.className = "nav";
  header.setAttribute("aria-label", "Navegación principal");

  header.innerHTML = `
    <a class="brand" href="#/" aria-label="STARMAKER inicio">
      <span class="brand-mark" aria-hidden="true"></span>
      STARMAKER
    </a>
    <nav class="nav-links">
      <a href="#/experiencias" class="${currentPath === '#/experiencias' ? 'is-active' : ''}">Experiencias</a>
      <a href="#/actividad" class="${currentPath === '#/actividad' ? 'is-active' : ''}">Actividad</a>
      <a href="#/universo" class="${currentPath === '#/universo' ? 'is-active' : ''}">Universo</a>
    </nav>
    <div style="display: flex; align-items: center; gap: 12px;">
      <a class="nav-cta" href="#/admin">Consola Admin</a>
    </div>
  `;

  return header;
}
