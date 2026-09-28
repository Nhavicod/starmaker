import { subscribeToAuth, loginAdmin, logoutAdmin, getCurrentUser } from "./auth.js";
import { renderAdminLayout, SAVE_STATUS } from "./AdminLayout.js";
import { renderSettingsEditor } from "./SettingsEditor.js";
import { renderCardEditor } from "./CardEditor.js";
import { renderMediaUploader } from "./MediaUploader.js";
import { saveState, normalizeState } from "../db.js";
import { store } from "../main.js";

let currentTab = "cards";
let saveStatus = SAVE_STATUS.CLEAN;
let localDraftState = null;
let isDirty = false;

window.addEventListener("beforeunload", (e) => {
  if (isDirty) {
    e.preventDefault();
    e.returnValue = "Tienes cambios sin guardar en la consola STARMAKER.";
  }
});

export function renderLoginView(container) {
  container.innerHTML = `
    <div class="admin-login-screen">
      <div class="glass-panel login-card">
        <span class="brand-logo-glow">✦</span>
        <h2 class="login-title">ACCESO ADMINISTRATIVO</h2>
        <p class="login-desc">Autentícate con credenciales autorizadas en Firebase Auth.</p>

        <form id="form-admin-login" class="login-form">
          <div class="form-group">
            <label for="admin-email">Correo Electrónico</label>
            <input type="email" id="admin-email" class="input-text" required autocomplete="username" />
          </div>

          <div class="form-group">
            <label for="admin-password">Contraseña</label>
            <input type="password" id="admin-password" class="input-text" required autocomplete="current-password" />
          </div>

          <div id="login-error-msg" class="login-error" style="display: none;"></div>

          <button type="submit" class="btn-primary" style="width: 100%; margin-top: var(--space-md);">
            ENTRAR A LA CONSOLA
          </button>
        </form>

        <a href="#/" class="login-back-link">← Regresar a la vista pública</a>
      </div>
    </div>
  `;

  const form = container.querySelector("#form-admin-login");
  const errorBox = container.querySelector("#login-error-msg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.style.display = "none";

    const email = container.querySelector("#admin-email").value.trim();
    const password = container.querySelector("#admin-password").value;

    try {
      await loginAdmin(email, password);
    } catch (err) {
      errorBox.textContent = `Acceso denegado: ${err.message}`;
      errorBox.style.display = "block";
    }
  });
}

export function renderAdminApp(targetContainer) {
  const user = getCurrentUser();

  if (!user) {
    renderLoginView(targetContainer);
    return;
  }

  if (!localDraftState) {
    localDraftState = JSON.parse(JSON.stringify(store.getState()));
    isDirty = false;
    saveStatus = SAVE_STATUS.CLEAN;
  }

  targetContainer.innerHTML = "";

  const layout = renderAdminLayout({
    activeTab: currentTab,
    saveStatus,
    userEmail: user.email
  });

  const contentArea = layout.querySelector("#admin-content-area");

  layout.querySelectorAll(".admin-tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentTab = btn.dataset.tab;
      renderAdminApp(targetContainer);
    });
  });

  const saveBtn = layout.querySelector("#btn-save-global");
  if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
      if (!isDirty) return;

      saveStatus = SAVE_STATUS.SAVING;
      renderAdminApp(targetContainer);

      try {
        const sanitized = normalizeState(localDraftState);
        await saveState(sanitized);

        isDirty = false;
        saveStatus = SAVE_STATUS.SAVED;
        renderAdminApp(targetContainer);

        setTimeout(() => {
          if (!isDirty) {
            saveStatus = SAVE_STATUS.CLEAN;
            renderAdminApp(targetContainer);
          }
        }, 3000);
      } catch (err) {
        saveStatus = SAVE_STATUS.ERROR;
        renderAdminApp(targetContainer);
      }
    });
  }

  layout.querySelector("#btn-admin-logout").addEventListener("click", async () => {
    if (isDirty && !confirm("Tienes cambios sin guardar. ¿Deseas salir de todas formas?")) {
      return;
    }
    localDraftState = null;
    isDirty = false;
    await logoutAdmin();
  });

  const onDraftUpdate = (patch) => {
    localDraftState = {
      ...localDraftState,
      ...patch
    };
    isDirty = true;
    saveStatus = SAVE_STATUS.DIRTY;
    renderAdminApp(targetContainer);
  };

  if (currentTab === "settings") {
    contentArea.appendChild(renderSettingsEditor(localDraftState, onDraftUpdate));
  } else if (currentTab === "media") {
    contentArea.appendChild(renderMediaUploader());
  } else {
    contentArea.appendChild(
      renderCardEditor(localDraftState.cards || [], (newCards) => {
        onDraftUpdate({ cards: newCards });
      })
    );
  }

  targetContainer.appendChild(layout);
}

subscribeToAuth(() => {
  if (window.location.hash.startsWith("#/admin")) {
    const root = document.getElementById("app");
    if (root) {
      renderAdminApp(root);
    }
  }
});
