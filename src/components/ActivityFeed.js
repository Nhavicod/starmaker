export function renderActivityFeed(activities = []) {
  const section = document.createElement("section");
  section.id = "actividad";

  const listData = activities.length > 0 ? activities : [
    { avatar: "S", title: "Nueva experiencia publicada", subtitle: "Hace 2 minutos · Sistema", status: "LIVE" },
    { avatar: "A", title: "Nuevo tutorial disponible", subtitle: "Hace 12 minutos · Learning", status: "LIVE" },
    { avatar: "✦", title: "STARMAKER actualizado", subtitle: "Hace 26 minutos · Platform", status: "SYNC" }
  ];

  section.innerHTML = `
    <div class="section-inner">
      <div class="section-head reveal visible">
        <div>
          <div class="kicker">02 · Realtime</div>
          <h2>Todo está<br>en movimiento.</h2>
        </div>
        <p class="section-desc">
          Telemetría y eventos de la plataforma sincronizados en tiempo real mediante Firestore.
        </p>
      </div>

      <div class="activity">
        <div class="panel reveal visible">
          <div class="kicker">Live feed</div>
          <div class="feed">
            ${listData
              .map(
                (item) => `
              <div class="feed-item">
                <div class="avatar">${item.avatar || item.user?.[0] || "✦"}</div>
                <div class="feed-main">
                  <strong>${item.title || item.user || "Evento"}</strong>
                  <span>${item.subtitle || item.action || "En curso"}</span>
                </div>
                <div class="status">${item.status || "LIVE"}</div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>

        <div class="panel reveal visible">
          <div class="kicker">System overview</div>
          <div class="stat-grid">
            <div class="stat"><strong>24/7</strong><span>Disponibilidad</span></div>
            <div class="stat"><strong>LIVE</strong><span>Contenido</span></div>
            <div class="stat"><strong>∞</strong><span>Experiencias</span></div>
            <div class="stat"><strong>01</strong><span>Universo</span></div>
          </div>
        </div>
      </div>
    </div>
  `;

  return section;
}
