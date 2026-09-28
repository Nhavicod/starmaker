export const SAVE_STATUS = {
  CLEAN: "CLEAN",
  DIRTY: "DIRTY",
  SAVING: "SAVING",
  SAVED: "SAVED",
  ERROR: "ERROR"
};

export function renderAdminLayout({ activeTab = "cards", saveStatus = SAVE_STATUS.CLEAN, userEmail = "" }) {
  const container = document.createElement("div");
  container.className = "admin-layout container";

  const getStatusBadge = () => {
    switch (saveStatus) {
      case SAVE_STATUS.DIRTY:
        return `<span class="save-status-badge status-dirty"><span class="dot">●</span> Cambios sin guardar</span>`;
      case SAVE_STATUS.SAVING:
        return `<span class="save-status-badge status-saving"><span class="spinner-dot">◌</span> Guardando...</span>`;
      case SAVE_STATUS.SAVED:
        return `<span class="save-status-badge status-saved">✓ Guardado</span>`;
      case SAVE_STATUS.ERROR:
        return `<span class="save-status-badge status-error">⚠ Error al guardar</span>`;
      case SAVE_STATUS.CLEAN:
      default:
        return `<span class="save-status-badge status-clean"><span class="dot">●</span> Sin cambios</span>`;
    }
  };

  container.innerHTML = `
    <header class="admin-topbar glass-panel">
      <div class="admin-brand">
        <a href="#/" class="admin-back-link" title="Volver a la vista pública">←</a>
        <div>
          <h1 class="admin-title">CONSOLA ADMINISTRATIVA</h1>
          <p class="admin-user-info">${userEmail || "Administrador Autorizado"}</p>
        </div>
      </div>

      <div class="admin-actions">
        ${getStatusBadge()}
        <button type="button" id="btn-save-global" class="btn-save" ${saveStatus !== SAVE_STATUS.DIRTY ? "disabled" : ""}>
          GUARDAR CAMBIOS
        </button>
        <button type="button" id="btn-admin-logout" class="btn-logout" title="Cerrar sesión">
          Salir
        </button>
      </div>
    </header>

    <nav class="admin-nav" aria-label="Secciones del panel de administración">
      <button type="button" class="admin-tab-btn ${activeTab === "cards" ? "is-active" : ""}" data-tab="cards">
        Tarjetas Holográficas
      </button>
      <button type="button" class="admin-tab-btn ${activeTab === "settings" ? "is-active" : ""}" data-tab="settings">
        Tema y Configuración
      </button>
      <button type="button" class="admin-tab-btn ${activeTab === "media" ? "is-active" : ""}" data-tab="media">
        Media Manager
      </button>
    </nav>

    <main id="admin-content-area" class="admin-main-view"></main>
  `;

  return container;
}
