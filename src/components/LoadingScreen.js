export function renderLoadingScreen(message = "SINCRONIZANDO CON EL NÚCLEO STARMAKER...") {
  const screen = document.createElement("div");
  screen.className = "loading-screen";
  screen.setAttribute("role", "status");

  screen.innerHTML = `
    <div class="loading-content">
      <div class="hologram-spinner" aria-hidden="true"></div>
      <p class="loading-label">${message}</p>
    </div>
  `;

  return screen;
}
