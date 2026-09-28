export function renderCardEditor(cards = [], onUpdate) {
  const container = document.createElement("div");
  container.className = "admin-card-manager";

  container.innerHTML = `
    <div class="card-manager-header">
      <h2 class="editor-section-title">Tarjetas Holográficas (${cards.length})</h2>
      <button type="button" id="btn-add-card" class="btn-secondary-sm">+ Nueva Tarjeta</button>
    </div>
    <div class="card-items-list" id="card-items-list"></div>
  `;

  const listContainer = container.querySelector("#card-items-list");

  const renderItems = () => {
    listContainer.innerHTML = "";

    cards.forEach((card, index) => {
      const cardRow = document.createElement("div");
      cardRow.className = "glass-card admin-card-item";

      cardRow.innerHTML = `
        <div class="card-item-header">
          <span class="card-item-order">#${index + 1}</span>
          <strong class="card-item-title">${card.title || "Sin Título"}</strong>
          <div class="card-item-controls">
            <label class="switch-label">
              <input type="checkbox" class="card-toggle-active" data-index="${index}" ${card.active !== false ? "checked" : ""} />
              Activa
            </label>
            <button type="button" class="btn-icon-danger btn-delete-card" data-index="${index}" title="Eliminar tarjeta">✕</button>
          </div>
        </div>

        <div class="card-form-grid">
          <div class="form-group">
            <label>Título</label>
            <input type="text" class="input-text card-input" data-index="${index}" data-prop="title" value="${card.title || ""}" />
          </div>

          <div class="form-group">
            <label>Subtítulo / Descripción</label>
            <input type="text" class="input-text card-input" data-index="${index}" data-prop="subtitle" value="${card.subtitle || ""}" />
          </div>

          <div class="form-group">
            <label>Badge Superior</label>
            <input type="text" class="input-text card-input" data-index="${index}" data-prop="badge" value="${card.badge || "EXPERIENCIA"}" />
          </div>

          <div class="form-group">
            <label>Enlace destino (Hash o URL)</label>
            <input type="text" class="input-text card-input" data-index="${index}" data-prop="link" value="${card.link || "#"}" />
          </div>

          <div class="form-group form-col-full">
            <label>URL Video WebM (Canal Alfa)</label>
            <input type="url" class="input-text card-input" data-index="${index}" data-prop="videoUrl" value="${card.videoUrl || ""}" placeholder="https://..." />
          </div>

          <div class="form-group form-col-full">
            <label>URL Imagen Póster (Fallback)</label>
            <input type="url" class="input-text card-input" data-index="${index}" data-prop="posterUrl" value="${card.posterUrl || ""}" placeholder="https://..." />
          </div>

          <div class="form-group">
            <label>Escala de Video (%)</label>
            <input type="number" class="input-text card-input" data-index="${index}" data-prop="videoScale" value="${card.videoScale || 100}" min="50" max="200" />
          </div>

          <div class="form-group">
            <label>Offset Y (px)</label>
            <input type="number" class="input-text card-input" data-index="${index}" data-prop="videoY" value="${card.videoY || 0}" />
          </div>
        </div>
      `;

      listContainer.appendChild(cardRow);
    });

    listContainer.querySelectorAll(".card-input").forEach((input) => {
      input.addEventListener("input", (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        const prop = e.target.dataset.prop;
        let val = e.target.value;
        if (e.target.type === "number") val = parseFloat(val) || 0;

        const updatedCards = [...cards];
        updatedCards[idx] = { ...updatedCards[idx], [prop]: val };
        onUpdate(updatedCards);
      });
    });

    listContainer.querySelectorAll(".card-toggle-active").forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        const updatedCards = [...cards];
        updatedCards[idx] = { ...updatedCards[idx], active: e.target.checked };
        onUpdate(updatedCards);
      });
    });

    listContainer.querySelectorAll(".btn-delete-card").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        const updatedCards = cards.filter((_, i) => i !== idx);
        onUpdate(updatedCards);
      });
    });
  };

  container.querySelector("#btn-add-card").addEventListener("click", () => {
    const newCard = {
      id: `card-${Date.now()}`,
      title: "NUEVA TARJETA",
      subtitle: "Descripción de la tarjeta holográfica",
      videoUrl: "",
      posterUrl: "",
      link: "#/",
      badge: "NUEVO",
      videoScale: 100,
      videoY: 0,
      active: true,
      order: cards.length + 1
    };
    onUpdate([...cards, newCard]);
  });

  renderItems();
  return container;
}
