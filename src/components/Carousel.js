export function renderCarousel(items = [], settings = {}) {
  const container = document.createElement("section");
  container.className = "carousel-section container";
  container.setAttribute("aria-label", "Destacados STARMAKER");

  if (!items || items.length === 0) return container;

  const autoplay = settings.autoplay !== false;
  const intervalTime = settings.interval || 5000;
  let currentIndex = 0;
  let timerId = null;

  container.innerHTML = `
    <div class="carousel-wrapper glass-panel">
      <div class="carousel-track" id="carousel-track">
        ${items
          .map(
            (item, index) => `
          <div class="carousel-slide ${index === 0 ? "is-active" : ""}" data-index="${index}" aria-hidden="${index !== 0}">
            <div class="slide-media">
              ${
                item.videoUrl
                  ? `<video src="${item.videoUrl}" autoplay loop muted playsinline disablepictureinpicture class="slide-video"></video>`
                  : `<img src="${item.imageUrl || "/assets/og-image.svg"}" alt="" class="slide-image" loading="lazy" />`
              }
            </div>
            <div class="slide-overlay">
              <span class="slide-tag">${item.tag || "DESTACADO"}</span>
              <h3 class="slide-title">${item.title || ""}</h3>
              <p class="slide-desc">${item.description || ""}</p>
              ${
                item.link
                  ? `<a href="${item.link}" class="btn-primary-sm">VER AHORA →</a>`
                  : ""
              }
            </div>
          </div>
        `
          )
          .join("")}
      </div>

      <button type="button" class="carousel-nav-btn prev" aria-label="Anterior">‹</button>
      <button type="button" class="carousel-nav-btn next" aria-label="Siguiente">›</button>

      <div class="carousel-dots" role="tablist">
        ${items
          .map(
            (_, idx) => `
          <button type="button" class="carousel-dot ${idx === 0 ? "is-active" : ""}" role="tab" aria-selected="${idx === 0}" aria-label="Ir a diapositiva ${idx + 1}" data-index="${idx}"></button>
        `
          )
          .join("")}
      </div>
    </div>
  `;

  const slides = container.querySelectorAll(".carousel-slide");
  const dots = container.querySelectorAll(".carousel-dot");
  const prevBtn = container.querySelector(".carousel-nav-btn.prev");
  const nextBtn = container.querySelector(".carousel-nav-btn.next");

  const goToSlide = (newIndex) => {
    slides[currentIndex].classList.remove("is-active");
    slides[currentIndex].setAttribute("aria-hidden", "true");
    dots[currentIndex].classList.remove("is-active");
    dots[currentIndex].setAttribute("aria-selected", "false");

    currentIndex = (newIndex + slides.length) % slides.length;

    slides[currentIndex].classList.add("is-active");
    slides[currentIndex].setAttribute("aria-hidden", "false");
    dots[currentIndex].classList.add("is-active");
    dots[currentIndex].setAttribute("aria-selected", "true");
  };

  const startAutoplay = () => {
    if (!autoplay || slides.length <= 1) return;
    stopAutoplay();
    timerId = setInterval(() => goToSlide(currentIndex + 1), intervalTime);
  };

  const stopAutoplay = () => {
    if (timerId) clearInterval(timerId);
  };

  prevBtn.addEventListener("click", () => {
    goToSlide(currentIndex - 1);
    startAutoplay();
  });

  nextBtn.addEventListener("click", () => {
    goToSlide(currentIndex + 1);
    startAutoplay();
  });

  dots.forEach((dot) => {
    dot.addEventListener("click", (e) => {
      goToSlide(parseInt(e.target.dataset.index, 10));
      startAutoplay();
    });
  });

  container.addEventListener("mouseenter", stopAutoplay);
  container.addEventListener("mouseleave", startAutoplay);

  let touchStartX = 0;
  container.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
    stopAutoplay();
  }, { passive: true });

  container.addEventListener("touchend", (e) => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) goToSlide(currentIndex + 1);
      else goToSlide(currentIndex - 1);
    }
    startAutoplay();
  }, { passive: true });

  startAutoplay();
  return container;
}
