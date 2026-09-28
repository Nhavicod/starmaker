import { renderHolographicCard } from "./HolographicCard.js";

export function renderCardGrid(cards = []) {
  const section = document.createElement("section");
  section.id = "experiencias";

  const sectionInner = document.createElement("div");
  sectionInner.className = "section-inner";

  sectionInner.innerHTML = `
    <div class="section-head reveal visible">
      <div>
        <div class="kicker">01 · Experiencias</div>
        <h2>Elige tu<br>próximo salto.</h2>
      </div>
      <p class="section-desc">
        Una interfaz construida alrededor de contenido dinámico sincronizado en tiempo real desde Firestore.
      </p>
    </div>
  `;

  const cardsContainer = document.createElement("div");
  cardsContainer.className = "cards";

  const activeCards = cards
    .filter((card) => card.active !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  activeCards.forEach((cardData, idx) => {
    cardsContainer.appendChild(renderHolographicCard(cardData, idx));
  });

  sectionInner.appendChild(cardsContainer);
  section.appendChild(sectionInner);
  return section;
}
