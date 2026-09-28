export function renderSettingsEditor(state, onChange) {
  const panel = document.createElement("div");
  panel.className = "glass-panel admin-settings-panel";

  const theme = state.theme || {};
  const carousel = state.carouselSettings || {};

  panel.innerHTML = `
    <h2 class="editor-section-title">Paleta Cromática Global</h2>
    <div class="form-grid">
      <div class="form-group">
        <label for="input-color-primary">Color Primario (Fuchsia / Acento)</label>
        <div class="color-picker-row">
          <input type="color" id="input-color-primary" value="${theme.primary || "#E64381"}" class="input-color" />
          <input type="text" id="input-text-primary" value="${theme.primary || "#E64381"}" class="input-text-sm" />
        </div>
      </div>

      <div class="form-group">
        <label for="input-color-accent">Color de Acento (Coral)</label>
        <div class="color-picker-row">
          <input type="color" id="input-color-accent" value="${theme.accent || "#F18D79"}" class="input-color" />
          <input type="text" id="input-text-accent" value="${theme.accent || "#F18D79"}" class="input-text-sm" />
        </div>
      </div>

      <div class="form-group">
        <label for="input-color-bg">Fondo Espacial</label>
        <div class="color-picker-row">
          <input type="color" id="input-color-bg" value="${theme.background || "#050507"}" class="input-color" />
          <input type="text" id="input-text-bg" value="${theme.background || "#050507"}" class="input-text-sm" />
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <h2 class="editor-section-title">Configuración del Carrusel</h2>
    <div class="form-grid">
      <div class="form-group-checkbox">
        <label class="checkbox-label">
          <input type="checkbox" id="input-carousel-autoplay" ${carousel.autoplay ? "checked" : ""} />
          Reproducción automática activada
        </label>
      </div>

      <div class="form-group">
        <label for="input-carousel-interval">Intervalo de cambio (milisegundos)</label>
        <input type="number" id="input-carousel-interval" value="${carousel.interval || 5000}" step="500" min="2000" class="input-text" />
      </div>
    </div>
  `;

  const bindColorSync = (colorInputId, textInputId, themeProp) => {
    const colorEl = panel.querySelector(`#${colorInputId}`);
    const textEl = panel.querySelector(`#${textInputId}`);

    colorEl.addEventListener("input", (e) => {
      textEl.value = e.target.value;
      onChange({
        theme: {
          ...state.theme,
          [themeProp]: e.target.value
        }
      });
    });

    textEl.addEventListener("change", (e) => {
      colorEl.value = e.target.value;
      onChange({
        theme: {
          ...state.theme,
          [themeProp]: e.target.value
        }
      });
    });
  };

  bindColorSync("input-color-primary", "input-text-primary", "primary");
  bindColorSync("input-color-accent", "input-text-accent", "accent");
  bindColorSync("input-color-bg", "input-text-bg", "background");

  panel.querySelector("#input-carousel-autoplay").addEventListener("change", (e) => {
    onChange({
      carouselSettings: {
        ...state.carouselSettings,
        autoplay: e.target.checked
      }
    });
  });

  panel.querySelector("#input-carousel-interval").addEventListener("change", (e) => {
    onChange({
      carouselSettings: {
        ...state.carouselSettings,
        interval: parseInt(e.target.value, 10) || 5000
      }
    });
  });

  return panel;
}
