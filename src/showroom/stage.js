import { PORTALES, DEFAULT_MASCOT_PORTALS } from "../config/defaults.js";
import { state } from "../services/bridge.js";

const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

window.puntoActualId = "card-registro";
window.currentPortal = 1;
window.State = { isTransitioning: false };

let currentPortalIndex = 0;
let sliderInterval = null;
let currentSliderIndex = 0;
let hasShowroomPlayed = false;

export function isOverlayBlockingShortcuts() {
  const adminOpen = document.getElementById("adminExecutiveOverlay")?.classList.contains("is-open");
  const mascotOpen = document.getElementById("mascot-widget")?.classList.contains("is-open");
  const vidModal = document.getElementById("video-preview-modal");
  const vidModalOpen = vidModal && vidModal.style.display !== "none";
  return Boolean(adminOpen || mascotOpen || vidModalOpen);
}

// ── HERO HEADLINE SLIDER (PURE OPACITY/TRANSFORM, ZERO REPAINT) ──
export function playSlider(portalId) {
  clearInterval(sliderInterval);
  const texts = Array.from(document.querySelectorAll(`.hero-slide[data-portal="${portalId}"]`));
  document.querySelectorAll(".hero-slide").forEach((el) => el.classList.remove("active"));

  if (!texts.length) return;
  if (portalId === 0 && hasShowroomPlayed) return;

  currentSliderIndex = 0;
  texts[0].classList.add("active");

  sliderInterval = setInterval(() => {
    texts.forEach((el) => el.classList.remove("active"));
    currentSliderIndex++;

    if (currentSliderIndex < texts.length) {
      texts[currentSliderIndex].classList.add("active");
    } else {
      clearInterval(sliderInterval);
      if (portalId === 0) {
        hasShowroomPlayed = true;
      } else {
        currentSliderIndex = 0;
        texts[0].classList.add("active");
        sliderInterval = setInterval(() => {
          texts.forEach((el) => el.classList.remove("active"));
          currentSliderIndex = (currentSliderIndex + 1) % texts.length;
          texts[currentSliderIndex].classList.add("active");
        }, 4000);
      }
    }
  }, 4000);
}

// ── HARDWARE-ACCELERATED NATIVE GPU MASCOT CONTROLLER (ZERO CPU PIXEL LOOPS) ──
class NativeGpuMascotSlot {
  constructor(id, videoId) {
    this.id = id;
    this.videoId = videoId;
  }

  get video() {
    return document.getElementById(this.videoId);
  }

  setSource(src) {
    const vid = this.video;
    if (!vid) return;

    const cleanSrc = src && src !== "NONE" ? String(src).trim() : "";
    const currentAttr = vid.getAttribute("src") || "";

    if (!cleanSrc) {
      if (currentAttr) {
        vid.pause();
        vid.removeAttribute("src");
        vid.load();
      }
      vid.classList.remove("is-active");
      updateMascotShadowVisibility();
      return;
    }

    if (currentAttr !== cleanSrc) {
      vid.setAttribute("src", cleanSrc);
      vid.load();
    }

    if (window.currentPortal === this.id && !document.body.classList.contains("portal-open")) {
      vid.classList.add("is-active");
      vid.play().catch(() => {});
    } else {
      vid.classList.remove("is-active");
      vid.pause();
    }
    updateMascotShadowVisibility();
  }
}

function updateMascotShadowVisibility() {
  const shadow = document.getElementById("mascot-shadow");
  const floatInner = document.querySelector(".mascot-float-inner");
  const activeVid = document.getElementById(`vid-p${window.currentPortal}`);
  const hasActiveVideo = Boolean(activeVid?.getAttribute("src"));

  if (shadow) shadow.classList.toggle("is-active", hasActiveVideo);
  if (floatInner) floatInner.classList.toggle("has-video", hasActiveVideo);
}

export function syncMascotStageFromState() {
  const root = document.documentElement;
  [1, 2, 3].forEach((id) => {
    const cfg = state.mascotPortals?.[id] || DEFAULT_MASCOT_PORTALS[id];
    const s = cfg.s ?? 1;
    const x = cfg.x ?? 0;
    const y = cfg.y ?? 0;

    root.style.setProperty(`--vp${id}-s`, s);
    root.style.setProperty(`--vp${id}-x`, `${x}px`);
    root.style.setProperty(`--vp${id}-y`, `${y}px`);

    const vidEl = document.getElementById(`vid-p${id}`);
    if (vidEl?.dataset?.uploading === "true") return;

    const preferredSrc = isSafari ? cfg.safari || cfg.chrome : cfg.chrome || cfg.safari;
    window.processors?.[id]?.setSource(preferredSrc);
  });
}

// ── PORTAL NAVIGATION & TRANSITIONS ──
export function seleccionarPunto(portalId, targetId, ctaText, accent, glow, rgb, _btnEl = null, dir = 1) {
  currentPortalIndex = (Number(portalId) - 1 + PORTALES.length) % PORTALES.length;

  const puck = document.getElementById("capsule-puck");
  const puckIcon = document.getElementById("puck-icon");
  const puckTitle = document.getElementById("puck-title");
  const pData = PORTALES[currentPortalIndex];

  if (pData && puckIcon && puckTitle) {
    puckIcon.className = `fa-solid ${pData.icon} puck-icon`;
    puckTitle.innerText = pData.name;
    if (puck) {
      puck.style.background = `linear-gradient(135deg, rgba(${rgb}, 0.35) 0%, rgba(20, 15, 30, 0.92) 100%)`;
      puck.style.boxShadow = `0 0 22px rgba(${rgb}, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.35)`;
    }
  }

  document.querySelectorAll(".capsule-dot").forEach((d, idx) => {
    d.classList.toggle("active", idx === currentPortalIndex);
  });

  window.puntoActualId = targetId;
  window.currentPortal = Number(portalId);

  const mainContent = document.getElementById("main-content");
  if (mainContent && document.body.classList.contains("portal-open")) {
    const outClass = dir >= 0 ? "anim-slide-out-left" : "anim-slide-out-right";
    const inClass = dir >= 0 ? "anim-slide-in-right" : "anim-slide-in-left";
    mainContent.classList.remove(
      "anim-slide-out-left",
      "anim-slide-out-right",
      "anim-slide-in-left",
      "anim-slide-in-right"
    );
    mainContent.classList.add(outClass);
    setTimeout(() => {
      mainContent.classList.remove(outClass);
      mainContent.classList.add(inClass);
      document.querySelectorAll(".accordion-card").forEach((c) => {
        c.style.display = "none";
        c.classList.remove("is-active");
      });
      const card = document.getElementById(targetId);
      if (card) {
        card.style.display = "block";
        card.classList.add("is-active");
      }
    }, 180);
  }

  const root = document.documentElement;
  root.style.setProperty("--theme-accent", accent);
  root.style.setProperty("--theme-glow", glow);
  root.style.setProperty("--theme-rgb", rgb);

  playSlider(Number(portalId));

  const ctaEl = document.getElementById("heroCtaText");
  if (ctaEl) ctaEl.innerText = ctaText;

  [1, 2, 3].forEach((id) => {
    const v = document.getElementById("vid-p" + id);
    if (!v) return;
    const hasValidSrc = Boolean(v.getAttribute("src"));
    if (id === Number(portalId) && hasValidSrc) {
      v.classList.add("is-active");
      if (!document.body.classList.contains("portal-open")) {
        v.play().catch(() => {});
      }
    } else {
      v.classList.remove("is-active");
      if (hasValidSrc) v.pause();
    }
  });
  updateMascotShadowVisibility();
}

export function irAlPuntoActual() {
  if (window.capsuleDock) window.capsuleDock.pauseAutoplay();
  [1, 2, 3].forEach((id) => {
    const v = document.getElementById("vid-p" + id);
    if (v?.getAttribute("src")) v.pause();
  });

  document.body.classList.remove("in-showroom");
  document.body.classList.add("portal-open");

  const main = document.getElementById("main-content");
  if (!main) return;
  main.classList.add("is-visible");
  main.scrollTop = 0;

  document.querySelectorAll(".accordion-card").forEach((c) => {
    c.style.display = "none";
    c.classList.remove("is-active");
  });
  const card = document.getElementById(window.puntoActualId);
  if (card) {
    card.style.display = "block";
    card.classList.add("is-active");
  }
}

export function volverAlShowroom() {
  if (window.capsuleDock) window.capsuleDock.resetAutoplay();

  document.body.classList.remove("portal-open");
  const main = document.getElementById("main-content");
  if (main) main.classList.remove("is-visible");

  setTimeout(() => {
    document.body.classList.add("in-showroom");
    playSlider(window.currentPortal);
    const v = document.getElementById("vid-p" + window.currentPortal);
    if (v?.getAttribute("src")) {
      v.play().catch(() => {});
    }
  }, 300);
}

// ── AUTOMATED DYNAMIC CAPSULE TRACKPAD (0-CPU GPU SCALEX PROGRESS BAR) ──
class AutomatedCapsuleTrackpad {
  constructor() {
    this.puck = document.getElementById("capsule-puck");
    this.trackpad = document.getElementById("capsule-trackpad");
    this.btnPrev = document.getElementById("capsule-btn-prev");
    this.btnNext = document.getElementById("capsule-btn-next");
    this.progressBar = document.getElementById("capsule-auto-progress");
    this.stageEl = document.getElementById("stage-container");
    this.mascotEl = document.getElementById("mascot-wrapper");

    this.isDragging = false;
    this.startX = 0;
    this.currentX = 0;
    this.lastX = 0;
    this.startTime = 0;
    this.lastTime = 0;
    this.velocity = 0;
    this.hasVibrated = false;

    this.maxTravel = 90;
    this.threshold = 36;

    this.autoplayInterval = 5500;
    this.idleResumeDelay = 6500;
    this.autoplayTimer = null;
    this.idleTimer = null;
    this.isAutoplayActive = true;

    if (!this.puck || !this.trackpad) return;

    this.initEvents();
    this.startAutoplay();
  }

  initEvents() {
    this.puck.addEventListener("pointerdown", (e) => this.onPointerDown(e));
    window.addEventListener("pointermove", (e) => this.onPointerMove(e), { passive: true });
    window.addEventListener("pointerup", (e) => this.onPointerUp(e));
    window.addEventListener("pointercancel", (e) => this.onPointerUp(e));

    this.btnPrev?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.interact();
      this.pulseButton(this.btnPrev);
      this.prev();
    });

    this.btnNext?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.interact();
      this.pulseButton(this.btnNext);
      this.next();
    });

    this.trackpad.addEventListener("click", (e) => {
      if (this.isDragging) return;
      if (e.target.closest("#capsule-puck") || e.target.closest(".capsule-arrow-btn")) return;

      this.interact();
      const rect = this.trackpad.getBoundingClientRect();
      if (e.clientX - rect.left < rect.width / 2) {
        this.pulseButton(this.btnPrev);
        this.prev();
      } else {
        this.pulseButton(this.btnNext);
        this.next();
      }
    });

    this.trackpad.addEventListener("mouseenter", () => this.pauseAutoplay());
    this.trackpad.addEventListener("mouseleave", () => {
      if (!document.body.classList.contains("portal-open")) {
        this.scheduleAutoplayResume();
      }
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) this.pauseAutoplay();
      else if (!document.body.classList.contains("portal-open")) this.startAutoplay();
    });

    window.addEventListener("keydown", (e) => {
      const tag = e.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || e.target?.isContentEditable) {
        return;
      }

      if (e.key === "Escape") {
        const openAdminModal = document.querySelector("#adminExecutiveOverlay .modal.open");
        if (openAdminModal) {
          openAdminModal.classList.remove("open");
          return;
        }
        const openDrawerEl = document.querySelector("#adminExecutiveOverlay .drawer.open");
        if (openDrawerEl) {
          openDrawerEl.classList.remove("open");
          return;
        }
        const vidModal = document.getElementById("video-preview-modal");
        if (vidModal && vidModal.style.display !== "none") {
          window.cerrarVideoModal?.();
          return;
        }
        if (document.getElementById("adminExecutiveOverlay")?.classList.contains("is-open")) {
          window.closeExecutiveAdmin?.();
          return;
        }
        if (document.getElementById("mascot-widget")?.classList.contains("is-open")) {
          window.closeMascotWidget?.();
          return;
        }
        if (document.body.classList.contains("portal-open")) {
          volverAlShowroom();
        }
        return;
      }

      if (isOverlayBlockingShortcuts()) return;

      if (e.key === "ArrowLeft") {
        this.interact();
        this.pulseButton(this.btnPrev);
        this.prev();
      } else if (e.key === "ArrowRight") {
        this.interact();
        this.pulseButton(this.btnNext);
        this.next();
      } else if ((e.key === "Enter" || e.key === " " || e.key === "ArrowDown") && !document.body.classList.contains("portal-open")) {
        e.preventDefault();
        irAlPuntoActual();
      }
    });
  }

  // Zero-JS-RAF GPU CSS transition for autoplay bar
  startAutoplay() {
    if (!this.isAutoplayActive || document.body.classList.contains("portal-open") || document.hidden) return;
    this.clearAutoplay();
    this.trackpad.classList.add("is-autoplay");

    if (this.progressBar) {
      this.progressBar.style.transition = "none";
      this.progressBar.style.transform = "scaleX(0)";
      // Force single cheap style flush then delegate 5.5s animation to GPU compositor
      void this.progressBar.offsetWidth;
      this.progressBar.style.transition = `transform ${this.autoplayInterval}ms linear`;
      this.progressBar.style.transform = "scaleX(1)";
    }

    this.autoplayTimer = setTimeout(() => {
      this.next();
    }, this.autoplayInterval);
  }

  pauseAutoplay() {
    this.clearAutoplay();
    this.trackpad.classList.remove("is-autoplay");
    if (this.progressBar) {
      this.progressBar.style.transition = "none";
      this.progressBar.style.transform = "scaleX(0)";
    }
  }

  scheduleAutoplayResume() {
    clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => {
      if (!document.body.classList.contains("portal-open")) {
        this.isAutoplayActive = true;
        this.startAutoplay();
      }
    }, this.idleResumeDelay);
  }

  clearAutoplay() {
    clearTimeout(this.autoplayTimer);
    clearTimeout(this.idleTimer);
  }

  interact() {
    this.pauseAutoplay();
    this.scheduleAutoplayResume();
  }

  pulseButton(btn) {
    if (!btn) return;
    btn.classList.add("glow-active");
    setTimeout(() => btn.classList.remove("glow-active"), 240);
  }

  onPointerDown(e) {
    if (e.target.closest(".capsule-arrow-btn")) return;
    e.preventDefault();
    this.interact();

    try {
      this.puck.setPointerCapture(e.pointerId);
    } catch (_) {}

    this.isDragging = true;
    this.startX = e.clientX;
    this.currentX = e.clientX;
    this.lastX = e.clientX;
    this.startTime = performance.now();
    this.lastTime = this.startTime;
    this.velocity = 0;
    this.hasVibrated = false;

    this.puck.style.cursor = "grabbing";
    this.puck.style.transition = "none";
  }

  onPointerMove(e) {
    if (!this.isDragging) return;
    const now = performance.now();
    this.currentX = e.clientX;

    const dt = now - this.lastTime;
    if (dt > 10) {
      this.velocity = (this.currentX - this.lastX) / dt;
      this.lastX = this.currentX;
      this.lastTime = now;
    }

    const rawDelta = this.currentX - this.startX;
    const sign = Math.sign(rawDelta);
    const absDelta = Math.abs(rawDelta);

    const resistedDelta = sign * Math.min(this.maxTravel, Math.pow(absDelta, 0.86) * 1.25);
    const stretch = 1 + absDelta / 420;

    this.puck.style.transform = `translate(calc(-50% + ${resistedDelta}px), -50%) scaleX(${stretch})`;

    if (this.stageEl) {
      this.stageEl.style.transition = "none";
      this.stageEl.style.transform = `translateX(calc(-50% + ${resistedDelta * 0.45}px)) rotateX(72deg)`;
    }
    if (this.mascotEl) {
      this.mascotEl.style.transition = "none";
      this.mascotEl.style.transform = `translateX(calc(-50% + ${resistedDelta * 0.55}px))`;
    }

    if (resistedDelta > 14) {
      this.btnNext?.classList.add("glow-active");
      this.btnPrev?.classList.remove("glow-active");
    } else if (resistedDelta < -14) {
      this.btnPrev?.classList.add("glow-active");
      this.btnNext?.classList.remove("glow-active");
    } else {
      this.btnPrev?.classList.remove("glow-active");
      this.btnNext?.classList.remove("glow-active");
    }

    if (Math.abs(resistedDelta) >= this.threshold) {
      if (!this.puck.classList.contains("is-armed")) {
        this.puck.classList.add("is-armed");
        if (!this.hasVibrated && navigator.vibrate) {
          navigator.vibrate(12);
          this.hasVibrated = true;
        }
      }
    } else {
      this.puck.classList.remove("is-armed");
      this.hasVibrated = false;
    }
  }

  onPointerUp(e) {
    if (!this.isDragging) return;
    this.isDragging = false;
    try {
      this.puck.releasePointerCapture(e.pointerId);
    } catch (_) {}

    this.puck.style.cursor = "grab";
    this.btnPrev?.classList.remove("glow-active");
    this.btnNext?.classList.remove("glow-active");

    const rawDelta = this.currentX - this.startX;
    const absDelta = Math.abs(rawDelta);
    const sign = Math.sign(rawDelta);
    const duration = performance.now() - this.startTime;

    if (absDelta < 7 && duration < 280) {
      this.resetPuckSpring();
      irAlPuntoActual();
      return;
    }

    const isFling = Math.abs(this.velocity) > 0.32;
    const isPastThreshold = absDelta >= this.threshold;
    this.resetPuckSpring();

    if (isFling || isPastThreshold) {
      const direction = isFling ? Math.sign(this.velocity) : sign;
      if (direction > 0) this.next();
      else if (direction < 0) this.prev();
    }
  }

  resetPuckSpring() {
    this.puck.style.transition =
      "transform 360ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 250ms ease, border-color 250ms ease";
    this.puck.style.transform = "translate(-50%, -50%) scaleX(1)";
    this.puck.classList.remove("is-armed");

    if (this.stageEl) {
      this.stageEl.style.transition = "transform 360ms cubic-bezier(0.25, 1, 0.5, 1)";
      this.stageEl.style.transform = "translateX(-50%) rotateX(72deg)";
    }
    if (this.mascotEl) {
      this.mascotEl.style.transition = "transform 360ms cubic-bezier(0.25, 1, 0.5, 1)";
      this.mascotEl.style.transform = "translateX(-50%)";
    }
  }

  goTo(index, forcedDir = 0) {
    const prevIndex = currentPortalIndex;
    currentPortalIndex = (index + PORTALES.length) % PORTALES.length;

    let dir = forcedDir;
    if (dir === 0) {
      if (prevIndex === 0 && currentPortalIndex === PORTALES.length - 1) dir = -1;
      else if (prevIndex === PORTALES.length - 1 && currentPortalIndex === 0) dir = 1;
      else dir = currentPortalIndex >= prevIndex ? 1 : -1;
    }

    const p = PORTALES[currentPortalIndex];

    if (this.stageEl && this.mascotEl && !document.body.classList.contains("portal-open")) {
      this.stageEl.style.transition = "transform 150ms cubic-bezier(0.4, 0, 0.8, 1), opacity 150ms ease";
      this.mascotEl.style.transition = "transform 150ms cubic-bezier(0.4, 0, 0.8, 1), opacity 150ms ease";
      this.stageEl.style.transform = `translateX(calc(-50% + ${-dir * 75}px)) rotateX(72deg)`;
      this.mascotEl.style.transform = `translateX(calc(-50% + ${-dir * 95}px))`;
      this.stageEl.style.opacity = "0.25";
      this.mascotEl.style.opacity = "0.25";

      setTimeout(() => {
        this.stageEl.style.transition = "none";
        this.mascotEl.style.transition = "none";
        this.stageEl.style.transform = `translateX(calc(-50% + ${dir * 75}px)) rotateX(72deg)`;
        this.mascotEl.style.transform = `translateX(calc(-50% + ${dir * 95}px))`;

        requestAnimationFrame(() => {
          this.stageEl.style.transition = "transform 280ms cubic-bezier(0.16, 1, 0.3, 1), opacity 280ms ease";
          this.mascotEl.style.transition = "transform 280ms cubic-bezier(0.16, 1, 0.3, 1), opacity 280ms ease";
          this.stageEl.style.transform = "translateX(-50%) rotateX(72deg)";
          this.mascotEl.style.transform = "translateX(-50%)";
          this.stageEl.style.opacity = "1";
          this.mascotEl.style.opacity = "1";
        });
      }, 155);
    }

    seleccionarPunto(p.id, p.targetId, p.ctaText, p.accent, p.glow, p.rgb, null, dir);

    const puckContent = document.getElementById("puck-content");
    const puckIcon = document.getElementById("puck-icon");
    const puckTitle = document.getElementById("puck-title");

    if (puckContent) {
      puckContent.classList.add("puck-flip-out");
      setTimeout(() => {
        if (puckIcon) puckIcon.className = `fa-solid ${p.icon} puck-icon`;
        if (puckTitle) puckTitle.innerText = p.name;
        puckContent.classList.remove("puck-flip-out");
        puckContent.classList.add("puck-flip-in");
        setTimeout(() => puckContent.classList.remove("puck-flip-in"), 160);
      }, 95);
    }

    if (this.isAutoplayActive && !document.body.classList.contains("portal-open")) {
      this.startAutoplay();
    }
  }

  next() {
    this.goTo(currentPortalIndex + 1, 1);
  }

  prev() {
    this.goTo(currentPortalIndex - 1, -1);
  }

  resetAutoplay() {
    this.isAutoplayActive = true;
    this.startAutoplay();
  }
}

export function initShowroomStage() {
  window.processors = {
    1: new NativeGpuMascotSlot(1, "vid-p1"),
    2: new NativeGpuMascotSlot(2, "vid-p2"),
    3: new NativeGpuMascotSlot(3, "vid-p3")
  };

  syncMascotStageFromState();
  window.capsuleDock = new AutomatedCapsuleTrackpad();
  setTimeout(() => playSlider(0), 400);
}
