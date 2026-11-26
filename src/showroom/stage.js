import { PORTALES, DEFAULT_MASCOT_PORTALS } from "../config/defaults.js";
import { state } from "../services/bridge.js";

const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

window.puntoActualId = "card-registro";
window.currentPortal = 1;
window.State = {
  isTransitioning: false,
  targetPortalCenter: null
};

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

// ── HERO HEADLINE SLIDER ──
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

// ── GPU PARTICLE ENGINE ──
class ParticleEngine {
  constructor() {
    this.canvas = document.getElementById("ctx-background");
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d", { alpha: true });
    this.particles = [];
    this.currentColor = "139, 92, 246";
    this.isRunning = false;
    this.rafId = null;
    this.w = window.innerWidth;
    this.h = window.innerHeight;

    window.addEventListener("resize", () => this.resize(), { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) this.stop();
      else if (!document.body.classList.contains("portal-open")) this.start();
    });

    this.resize();
    this.spawnParticles();
    this.start();
  }

  resize() {
    if (!this.canvas) return;
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.canvas.width = Math.round(this.w * dpr);
    this.canvas.height = Math.round(this.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  setColor(rgbString) {
    this.currentColor = rgbString;
  }

  spawnParticles() {
    this.particles = [];
    const count = window.innerWidth < 768 ? 14 : 24;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.w,
        y: Math.random() * this.h,
        size: Math.random() * 2 + 0.8,
        speed: Math.random() * 0.4 + 0.15,
        opacity: Math.random() * 0.5 + 0.25,
        angle: Math.random() * Math.PI * 2,
        wobble: Math.random() * 0.02 + 0.005
      });
    }
  }

  start() {
    if (!this.canvas || this.isRunning) return;
    this.isRunning = true;
    this.render();
  }

  stop() {
    this.isRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  render() {
    if (!this.isRunning) return;
    this.ctx.clearRect(0, 0, this.w, this.h);

    const rgb = this.currentColor;
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.y -= p.speed;
      p.x += Math.sin(p.angle) * 0.5;
      p.angle += p.wobble;

      if (p.y < -10) p.y = this.h + 10;
      if (p.x < -10) p.x = this.w + 10;
      if (p.x > this.w + 10) p.x = -10;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * 2.2, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${rgb}, ${p.opacity * 0.22})`;
      this.ctx.fill();

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.85})`;
      this.ctx.fill();
    }
    this.rafId = requestAnimationFrame(() => this.render());
  }
}

// ── CHROMA KEY + ALPHA VIDEO PROCESSOR (30FPS THROTTLED) ──
class VideoProcessor {
  constructor(id, videoId, canvasId) {
    this.id = id;
    this.canvas = document.getElementById(canvasId);
    this.video = document.getElementById(videoId);
    this.isPlaying = false;
    this.lastFrameTime = 0;
    this.lastVideoTime = -1;
    this.rafId = null;
    this.canReadPixels = true;

    if (!this.canvas || !this.video) return;
    this.ctx = this.canvas.getContext("2d", { willReadFrequently: true, alpha: true });
    this.bindVideo();
  }

  bindVideo() {
    if (!this.video) return;
    this.canReadPixels = true;

    this.video.addEventListener("loadedmetadata", () => {
      const maxW = 340;
      const ratio = this.video.videoWidth / this.video.videoHeight || 1;
      this.canvas.width = Math.min(this.video.videoWidth || maxW, maxW);
      this.canvas.height = Math.round(this.canvas.width / ratio);
    });

    this.video.addEventListener("play", () => {
      this.isPlaying = true;
      this.processFrame();
    });

    const onStop = () => {
      this.isPlaying = false;
      if (this.rafId) cancelAnimationFrame(this.rafId);
    };

    this.video.addEventListener("pause", onStop);
    this.video.addEventListener("ended", onStop);
  }

  setSource(src, { localBlob = false } = {}) {
    const oldVid = document.getElementById("vid-p" + this.id);
    if (!oldVid) return;

    if (!src || src === "NONE") {
      oldVid.removeAttribute("src");
      oldVid.load();
      this.canvas?.classList.remove("is-active");
      return;
    }

    const currentAttr = oldVid.getAttribute("src") || "";
    if (currentAttr === src && !localBlob) {
      if (window.currentPortal === this.id && !document.body.classList.contains("portal-open")) {
        this.canvas?.classList.add("is-active");
        oldVid.play().catch(() => {});
      }
      return;
    }

    const cloneVid = oldVid.cloneNode(false);
    if (localBlob || src.startsWith("blob:") || src.startsWith("data:")) {
      cloneVid.removeAttribute("crossorigin");
    } else {
      cloneVid.setAttribute("crossorigin", "anonymous");
    }
    cloneVid.setAttribute("src", src);
    oldVid.parentNode.replaceChild(cloneVid, oldVid);

    this.video = cloneVid;
    this.isPlaying = false;
    this.lastVideoTime = -1;
    this.bindVideo();
    cloneVid.load();

    if (window.currentPortal === this.id && !document.body.classList.contains("portal-open")) {
      this.canvas?.classList.add("is-active");
      cloneVid.play().catch(() => {});
    }
  }

  processFrame() {
    if (!this.isPlaying || !this.video || this.video.paused || this.video.ended) return;

    if (
      window.currentPortal !== this.id ||
      document.body.classList.contains("portal-open") ||
      document.hidden
    ) {
      this.isPlaying = false;
      return;
    }

    const now = performance.now();
    if (now - this.lastFrameTime < 32 || this.video.currentTime === this.lastVideoTime) {
      this.rafId = requestAnimationFrame(() => this.processFrame());
      return;
    }

    this.lastFrameTime = now;
    this.lastVideoTime = this.video.currentTime;

    const w = this.canvas.width;
    const h = this.canvas.height;
    if (w > 0 && h > 0) {
      this.ctx.clearRect(0, 0, w, h);
      this.ctx.drawImage(this.video, 0, 0, w, h);

      if (this.canReadPixels) {
        try {
          const frameData = this.ctx.getImageData(0, 0, w, h);
          const data = frameData.data;
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            if (r > 235 && g > 235 && b > 235) {
              const max = Math.max(r, g, b);
              const min = Math.min(r, g, b);
              if (max - min < 15) {
                data[i + 3] = min > 245 ? 0 : Math.round(255 * (1 - (min - 235) / 10));
              }
            }
          }
          this.ctx.putImageData(frameData, 0, 0);
        } catch (_) {
          this.canReadPixels = false;
        }
      }
    }

    this.rafId = requestAnimationFrame(() => this.processFrame());
  }
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
      puck.style.background = `linear-gradient(135deg, rgba(${rgb}, 0.35) 0%, rgba(20, 15, 30, 0.88) 100%)`;
      puck.style.boxShadow = `0 0 25px rgba(${rgb}, 0.45), inset 0 1px 2px rgba(255, 255, 255, 0.4)`;
    }
  }

  document.querySelectorAll(".capsule-dot").forEach((d, idx) => {
    d.classList.toggle("active", idx === currentPortalIndex);
  });

  window.puntoActualId = targetId;
  window.currentPortal = Number(portalId);

  window.State.isTransitioning = true;
  if (window.particleSys) window.particleSys.setColor(rgb);

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
    }, 210);
  }

  setTimeout(() => {
    window.State.isTransitioning = false;
  }, 550);

  const root = document.documentElement;
  root.style.setProperty("--theme-accent", accent);
  root.style.setProperty("--theme-glow", glow);
  root.style.setProperty("--theme-rgb", rgb);

  playSlider(Number(portalId));

  const ctaEl = document.getElementById("heroCtaText");
  if (ctaEl) ctaEl.innerText = ctaText;

  [1, 2, 3].forEach((id) => {
    const v = document.getElementById("vid-p" + id);
    const c = document.getElementById("canvas-p" + id);
    if (!v || !c) return;
    const hasValidSrc = v.getAttribute("src") && v.getAttribute("src") !== "NONE";
    if (id === Number(portalId) && hasValidSrc) {
      c.classList.add("is-active");
      if (!document.body.classList.contains("portal-open")) {
        v.play().catch(() => {});
      }
    } else {
      c.classList.remove("is-active");
      v.pause();
    }
  });

  const stage = document.getElementById("stage-container");
  const mascot = document.getElementById("mascot-wrapper");
  if (stage && mascot) {
    stage.classList.add("portal-prep");
    mascot.classList.add("portal-prep");
    setTimeout(() => {
      stage.classList.remove("portal-prep");
      mascot.classList.remove("portal-prep");
    }, 320);
  }
}

export function irAlPuntoActual() {
  if (window.particleSys) window.particleSys.stop();
  if (window.capsuleDock) window.capsuleDock.pauseAutoplay();
  [1, 2, 3].forEach((id) => document.getElementById("vid-p" + id)?.pause());

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
  if (window.particleSys) window.particleSys.start();
  if (window.capsuleDock) window.capsuleDock.resetAutoplay();

  document.body.classList.remove("portal-open");
  const main = document.getElementById("main-content");
  if (main) main.classList.remove("is-visible");

  setTimeout(() => {
    document.body.classList.add("in-showroom");
    playSlider(window.currentPortal);
    const v = document.getElementById("vid-p" + window.currentPortal);
    if (v && v.getAttribute("src") && v.getAttribute("src") !== "NONE") {
      v.play().catch(() => {});
    }
  }, 400);
}

// ── AUTOMATED DYNAMIC CAPSULE TRACKPAD ──
class AutomatedCapsuleTrackpad {
  constructor() {
    this.puck = document.getElementById("capsule-puck");
    this.trackpad = document.getElementById("capsule-trackpad");
    this.btnPrev = document.getElementById("capsule-btn-prev");
    this.btnNext = document.getElementById("capsule-btn-next");
    this.dots = document.querySelectorAll(".capsule-dot");
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
    this.idleTimer = null;
    this.progressRaf = null;
    this.progressStart = 0;
    this.isAutoplayActive = true;

    if (!this.puck || !this.trackpad) return;

    this.initEvents();
    this.startAutoplay();
  }

  initEvents() {
    this.puck.addEventListener("pointerdown", (e) => this.onPointerDown(e));
    window.addEventListener("pointermove", (e) => this.onPointerMove(e), { passive: false });
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

  startAutoplay() {
    if (!this.isAutoplayActive || document.body.classList.contains("portal-open")) return;
    this.clearAutoplay();
    this.trackpad.classList.add("is-autoplay");

    this.progressStart = performance.now();
    const updateProgress = (now) => {
      const elapsed = now - this.progressStart;
      const progress = Math.min(100, (elapsed / this.autoplayInterval) * 100);
      if (this.progressBar) this.progressBar.style.width = `${progress}%`;

      if (elapsed < this.autoplayInterval) {
        this.progressRaf = requestAnimationFrame(updateProgress);
      } else {
        this.next();
        this.startAutoplay();
      }
    };
    this.progressRaf = requestAnimationFrame(updateProgress);
  }

  pauseAutoplay() {
    this.clearAutoplay();
    this.trackpad.classList.remove("is-autoplay");
    if (this.progressBar) this.progressBar.style.width = "0%";
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
    if (this.progressRaf) {
      cancelAnimationFrame(this.progressRaf);
      this.progressRaf = null;
    }
    clearTimeout(this.idleTimer);
  }

  interact() {
    this.pauseAutoplay();
    this.scheduleAutoplayResume();
  }

  pulseButton(btn) {
    if (!btn) return;
    btn.classList.add("glow-active");
    setTimeout(() => btn.classList.remove("glow-active"), 260);
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
          navigator.vibrate(15);
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
      "transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 300ms ease, border-color 300ms ease";
    this.puck.style.transform = "translate(-50%, -50%) scaleX(1)";
    this.puck.classList.remove("is-armed");

    if (this.stageEl) {
      this.stageEl.style.transition = "transform 420ms cubic-bezier(0.25, 1, 0.5, 1)";
      this.stageEl.style.transform = "translateX(-50%) rotateX(72deg)";
    }
    if (this.mascotEl) {
      this.mascotEl.style.transition = "transform 420ms cubic-bezier(0.25, 1, 0.5, 1)";
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
      this.stageEl.style.transition = "transform 175ms cubic-bezier(0.4, 0, 0.8, 1), opacity 175ms ease";
      this.mascotEl.style.transition = "transform 175ms cubic-bezier(0.4, 0, 0.8, 1), opacity 175ms ease";
      this.stageEl.style.transform = `translateX(calc(-50% + ${-dir * 85}px)) rotateX(72deg)`;
      this.mascotEl.style.transform = `translateX(calc(-50% + ${-dir * 105}px))`;
      this.stageEl.style.opacity = "0.2";
      this.mascotEl.style.opacity = "0.2";

      setTimeout(() => {
        this.stageEl.style.transition = "none";
        this.mascotEl.style.transition = "none";
        this.stageEl.style.transform = `translateX(calc(-50% + ${dir * 85}px)) rotateX(72deg)`;
        this.mascotEl.style.transform = `translateX(calc(-50% + ${dir * 105}px))`;

        requestAnimationFrame(() => {
          this.stageEl.style.transition = "transform 330ms cubic-bezier(0.16, 1, 0.3, 1), opacity 330ms ease";
          this.mascotEl.style.transition = "transform 330ms cubic-bezier(0.16, 1, 0.3, 1), opacity 330ms ease";
          this.stageEl.style.transform = "translateX(-50%) rotateX(72deg)";
          this.mascotEl.style.transform = "translateX(-50%)";
          this.stageEl.style.opacity = "1";
          this.mascotEl.style.opacity = "1";
        });
      }, 180);
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
        setTimeout(() => puckContent.classList.remove("puck-flip-in"), 180);
      }, 105);
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
  window.particleSys = new ParticleEngine();
  window.processors = {
    1: new VideoProcessor(1, "vid-p1", "canvas-p1"),
    2: new VideoProcessor(2, "vid-p2", "canvas-p2"),
    3: new VideoProcessor(3, "vid-p3", "canvas-p3")
  };

  syncMascotStageFromState();
  window.capsuleDock = new AutomatedCapsuleTrackpad();
  setTimeout(() => playSlider(0), 700);
}
