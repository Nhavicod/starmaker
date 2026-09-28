export function renderMascotLayer(mascotConfig = {}) {
  const streamer = mascotConfig.streamer || {};
  const gifUrl = streamer.gif || "";

  if (!gifUrl) return document.createDocumentFragment();

  const wrapper = document.createElement("aside");
  wrapper.className = "mascot-floating-layer";
  wrapper.setAttribute("aria-hidden", "true");

  wrapper.style.setProperty("--mascot-x", `${streamer.x || 0}px`);
  wrapper.style.setProperty("--mascot-y", `${streamer.y || 0}px`);
  wrapper.style.setProperty("--mascot-scale", `${(streamer.scale || 100) / 100}`);

  wrapper.innerHTML = `
    <div class="mascot-container">
      <div class="mascot-aura"></div>
      <img src="${gifUrl}" alt="" class="mascot-image" loading="lazy" />
    </div>
  `;

  return wrapper;
}
