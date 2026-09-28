export function renderHolographicCard(cardData, index = 0) {
  const card = document.createElement("article");
  card.className = "card tilt reveal visible";
  card.setAttribute("data-id", cardData.id || "");

  const padIndex = String(index + 1).padStart(2, "0");
  const badgeText = cardData.badge || (index === 0 ? "EXPERIENCE" : index === 1 ? "LEARNING" : "COMMUNITY");

  card.innerHTML = `
    <div class="card-art">
      <div class="card-grid"></div>
      ${
        (index === 0 || cardData.videoUrl)
          ? `
        <video 
          class="card-custom-video"
          src="${index === 0 ? '/leonsito.webm' : cardData.videoUrl}"
          autoplay
          loop
          muted
          playsinline
          disablepictureinpicture>
        </video>
      `
          : ""
      }
    </div>
    <div class="card-content">
      <div class="card-index">${padIndex} / ${badgeText}</div>
      <h3>${cardData.title}</h3>
      <p>${cardData.subtitle || ""}</p>
      <a class="card-link" href="${cardData.link || "#/universo"}">Explorar <span>→</span></a>
    </div>
  `;

  // Tilt interactivo
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const ry = (x - 0.5) * 8;
    const rx = (0.5 - y) * 8;
    card.style.setProperty("--rx", `${rx}deg`);
    card.style.setProperty("--ry", `${ry}deg`);
  });

  card.addEventListener("pointerleave", () => {
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
  });

  return card;
}
