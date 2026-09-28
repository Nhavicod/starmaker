export function renderHero() {
  const heroSection = document.createElement("section");
  heroSection.className = "hero";
  heroSection.id = "inicio";

  heroSection.innerHTML = `
    <div class="hero-inner">
      <div>
        <div class="eyebrow"><span class="pulse"></span> Plataforma digital · Live experience</div>
        <h1>Explora un<br><span class="gradient-text">nuevo universo.</span></h1>
        <p class="hero-copy">
          STARMAKER conecta entretenimiento, streaming y creatividad en una experiencia inmersiva sincronizada en tiempo real con Firestore y Google Sheets.
        </p>
        <div class="actions">
          <a class="btn btn-primary" href="#registro">Completar Registro →</a>
          <button type="button" class="btn btn-secondary" id="btn-hero-admin">Panel de Control</button>
        </div>
      </div>

      <div class="hero-stage" aria-hidden="true">
        <div class="mascot-pedestal"></div>
        <video 
          class="hero-mascot-video"
          autoplay 
          loop 
          muted 
          playsinline 
          webkit-playsinline 
          disablepictureinpicture
          preload="auto">
          <source src="/assets/leonsito.webm" type="video/webm">
          <source src="assets/leonsito.webm" type="video/webm">
          <source src="leonsito.webm" type="video/webm">
        </video>
        <div class="float-card small">
          <div class="fc-label">Mascota Oficial</div>
          <div class="fc-value">✦ STARMAKER LIVE</div>
        </div>
        <div class="float-card tiny">
          <div class="fc-label">Transmisión</div>
          <div class="fc-value">Sin fondo · 60 FPS</div>
        </div>
      </div>
    </div>
  `;

  return heroSection;
}
