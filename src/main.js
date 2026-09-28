import { createStore } from "./state.js";
import { subscribeToState, DEFAULT_STATE } from "./db.js";
import { Router } from "./router.js";

import { renderHeader } from "./components/Header.js";
import { renderHero } from "./components/Hero.js";
import { renderCardGrid } from "./components/CardGrid.js";
import { renderActivityFeed } from "./components/ActivityFeed.js";
import { renderAdminApp } from "./admin/admin.js";

export const store = createStore(DEFAULT_STATE);
const appRoot = document.getElementById("app");
const router = new Router();

function applyDynamicTheme(themeConfig) {
  if (!themeConfig) return;
  const rootStyle = document.documentElement.style;
  if (themeConfig.primary) rootStyle.setProperty("--fuchsia", themeConfig.primary);
  if (themeConfig.accent) rootStyle.setProperty("--coral", themeConfig.accent);
  if (themeConfig.background) rootStyle.setProperty("--black-1", themeConfig.background);
}

function renderPublicLayout(state) {
  const shell = document.createElement("div");
  shell.className = "shell";

  // Estrellas y orbes de fondo espacial
  const bgElements = document.createElement("div");
  bgElements.innerHTML = `
    <div class="stars"></div>
    <div class="orb one"></div>
    <div class="orb two"></div>
  `;
  document.body.prepend(bgElements);

  // 1. Header
  const currentPath = window.location.hash || "#/";
  shell.appendChild(renderHeader(currentPath));

  // 2. Main
  const main = document.createElement("main");

  // Hero
  main.appendChild(renderHero());

  // Experiencias (Cards)
  main.appendChild(renderCardGrid(state.cards));

  // Actividad (Radar realtime)
  main.appendChild(renderActivityFeed(state.activity));

  // Sección Universo / Manifiesto
  const universoSection = document.createElement("section");
  universoSection.id = "universo";
  universoSection.innerHTML = `
    <div class="section-inner">
      <div class="panel reveal visible" style="text-align: center; padding: 70px 25px;">
        <div class="kicker">03 · STARMAKER</div>
        <h2>La tecnología<br><span class="gradient-text">desaparece.</span></h2>
        <p class="section-desc" style="margin: 22px auto 0;">
          Lo que queda es la experiencia. Conectado a Firestore con actualización reactiva en tiempo real.
        </p>
        <div class="actions" style="justify-content: center; margin-top: 30px;">
          <a class="btn btn-primary" href="#inicio">Volver arriba ↑</a>
          <a class="btn btn-secondary" href="#/admin">Consola de Administración</a>
        </div>
      </div>
    </div>
  `;
  main.appendChild(universoSection);
  shell.appendChild(main);

  // 3. Footer
  const footer = document.createElement("footer");
  footer.innerHTML = `
    <div class="footer-inner">
      <div class="footer-brand">STARMAKER</div>
      <div>Premium digital experience · Live build</div>
      <div>© 2026 STARMAKER</div>
    </div>
  `;
  shell.appendChild(footer);

  // Observador de revelado con scroll
  setTimeout(() => {
    const reveals = shell.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    reveals.forEach((el) => observer.observe(el));
  }, 50);

  return shell;
}

function renderApp() {
  const currentPath = window.location.hash || "#/";

  if (currentPath.startsWith("#/admin")) {
    renderAdminApp(appRoot);
    return;
  }

  const state = store.getState();
  applyDynamicTheme(state.theme);

  appRoot.innerHTML = "";
  appRoot.appendChild(renderPublicLayout(state));
}

store.subscribe(() => renderApp());
window.addEventListener("starmaker:navigate", () => renderApp());

// Suscripción en tiempo real a Firebase Firestore
subscribeToState(
  (remoteState) => {
    store.setState(remoteState);
  },
  (err) => {
    console.error("[STARMAKER] Error Firestore:", err);
  }
);
