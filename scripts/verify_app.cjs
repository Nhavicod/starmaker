const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

async function runVerification() {
  const distDir = path.join(__dirname, "..", "dist");
  if (!fs.existsSync(path.join(distDir, "index.html"))) {
    throw new Error("dist/index.html no existe. Ejecuta 'npm run build' primero.");
  }

  // Ensure zero video files exist in dist/
  const distFiles = fs.readdirSync(distDir);
  const strayVideos = distFiles.filter((f) => /\.(mp4|webm|mov)$/i.test(f));
  if (strayVideos.length > 0) {
    throw new Error("Aún existen archivos de video en dist/: " + strayVideos.join(", "));
  }

  const mimeMap = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml"
  };

  const server = http.createServer((req, res) => {
    const cleanUrl = (req.url || "/").split("?")[0];
    if (cleanUrl === "/api/submit-excel" && req.method === "POST") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, skipped: true }));
      return;
    }
    const relPath = cleanUrl === "/" ? "index.html" : cleanUrl.replace(/^\/+/, "");
    const fullPath = path.join(distDir, relPath);

    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      const ext = path.extname(fullPath).toLowerCase();
      res.writeHead(200, { "Content-Type": mimeMap[ext] || "application/octet-stream" });
      res.end(fs.readFileSync(fullPath));
    } else {
      res.writeHead(404);
      res.end("Not Found: " + cleanUrl);
    }
  });

  await new Promise((resolve) => server.listen(8997, resolve));
  console.log("Servidor de prueba activo en http://localhost:8997");

  const pageErrors = [];
  const consoleErrors = [];
  const notFoundUrls = [];

  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  try {
    const page = await browser.newPage();
    page.on("pageerror", (err) => pageErrors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("response", (res) => {
      if (res.status() === 404) notFoundUrls.push(res.url());
    });

    await page.goto("http://localhost:8997/", { waitUntil: "networkidle2" });

    // 1. Verify ZERO videos loaded & Showroom intact
    const showroomCheck = await page.evaluate(() => ({
      hasMascotBtn: Boolean(document.getElementById("btn-open-mascot")),
      hasAdminBtn: Boolean(document.getElementById("btn-open-admin")),
      hasAutoProgress: Boolean(document.getElementById("capsule-auto-progress")),
      vid1Src: document.getElementById("vid-p1")?.getAttribute("src") || "",
      vid2Src: document.getElementById("vid-p2")?.getAttribute("src") || "",
      vid3Src: document.getElementById("vid-p3")?.getAttribute("src") || "",
      anyRequestVideos: window.adminExecutiveState.requests.some((r) => Boolean(r.videoUrl))
    }));
    console.log("1. Showroom & Zero-Video Check:", showroomCheck);
    if (!showroomCheck.hasMascotBtn || !showroomCheck.hasAdminBtn || !showroomCheck.hasAutoProgress) {
      throw new Error("Fallo en controles principales del Showroom");
    }
    if (showroomCheck.vid1Src || showroomCheck.vid2Src || showroomCheck.vid3Src || showroomCheck.anyRequestVideos) {
      throw new Error("Aún quedan videos precargados activos");
    }

    // 2. Verify Mascot Calibrator remains 100% connected
    await page.click("#btn-open-mascot");
    await page.evaluate(() => {
      document.getElementById("sl-x-1").value = "40";
      window.liveTransform(1);
    });
    const varVp1X = await page.evaluate(() => document.documentElement.style.getPropertyValue("--vp1-x"));
    console.log("2. Mascot Calibrator Connected (--vp1-x):", varVp1X);
    if (varVp1X !== "40px") throw new Error("Calibrador desconectado");
    await page.evaluate(() => window.closeMascotWidget());

    // 3. Verify Admin Sleep/Awake Widgets + All 5 Tabs
    await page.click("#btn-open-admin");
    const pinSleepCheck = await page.evaluate(() => {
      window.togglePin("w-kpi");
      const isSunken = document.getElementById("w-kpi")?.classList.contains("sunken");
      window.wakeWidget("w-kpi");
      const isAwake = document.getElementById("w-kpi")?.classList.contains("pinned");
      return { isSunken, isAwake };
    });
    console.log("3. Sleep/Awake Widgets:", pinSleepCheck);
    if (!pinSleepCheck.isSunken || !pinSleepCheck.isAwake) throw new Error("Fallo en widgets dormidos/prendidos");

    for (const tab of ["overview", "requests", "tutorials", "support", "settings"]) {
      await page.evaluate((t) => window.setAdminTab(t), tab);
      const len = await page.evaluate(() => document.getElementById("adminView")?.innerHTML.length || 0);
      if (len < 100) throw new Error(`Pestaña ${tab} vacía`);
    }

    // 4. Verify Portal 2 <-> Admin Tutorials & Guide Modal Connection
    const tutorialSync = await page.evaluate(() => {
      window.setAdminTab("tutorials");
      document.getElementById("tutTitle").value = "Guía Rápida de Stream";
      document.getElementById("tutDesc").value = "Optimización en vivo";
      document.getElementById("tutUrlInput").value = "https://youtu.be/aqz-KE-bpKQ";
      window.addTutorialByUrl();
      window.closeExecutiveAdmin();

      const portal2Html = document.getElementById("tutoriales-catalog")?.innerHTML || "";
      window.abrirRecursoAcademia(0);
      const modalBody = document.getElementById("modal-video-body")?.innerHTML || "";
      window.cerrarVideoModal();
      return {
        inPortal2: portal2Html.includes("Guía Rápida de Stream"),
        hasEmbedSupport: modalBody.includes("youtube-nocookie.com/embed/aqz-KE-bpKQ")
      };
    });
    console.log("4. Conexión Admin -> Portal 2:", tutorialSync);
    if (!tutorialSync.inPortal2 || !tutorialSync.hasEmbedSupport) {
      throw new Error("Fallo en conexión de Academia Portal 2");
    }

    // 5. Verify Portal 3 <-> Admin Support, Socials & Tickets Connection
    const supportSync = await page.evaluate(async () => {
      window.openExecutiveAdmin();
      window.setAdminTab("support");
      window.editSupport(0, "name", "Asesor Rápido 24/7");
      window.setAdminTab("settings");
      window.updateSocial("tiktok", "https://tiktok.com/@starmaker_pro");
      window.closeExecutiveAdmin();

      document.getElementById("pt-name").value = "@estrella_live";
      document.getElementById("pt-msg").value = "Prueba de ticket ultrarrápido";
      await window.submitPublicTicket({ preventDefault() {}, target: { reset() {} } });

      return {
        advisorConnected: document.getElementById("soporte-list")?.innerHTML.includes("Asesor Rápido 24/7"),
        socialConnected: document.getElementById("portal-socials-bar")?.innerHTML.includes("@starmaker_pro"),
        ticketConnected: window.adminExecutiveState.tickets.some((t) => t.name === "@estrella_live")
      };
    });
    console.log("5. Conexión Portal 3 <-> Admin:", supportSync);
    if (!supportSync.advisorConnected || !supportSync.socialConnected || !supportSync.ticketConnected) {
      throw new Error("Fallo en conexión de Portal 3 y Admin");
    }

    if (notFoundUrls.length > 0) {
      throw new Error("Recursos 404 detectados: " + notFoundUrls.join(", "));
    }

    const criticalErrors = [...pageErrors, ...consoleErrors].filter(
      (e) => !e.includes("Firestore") && !e.includes("Firebase")
    );
    if (criticalErrors.length > 0) {
      throw new Error("Errores JS detectados: " + criticalErrors.join(" | "));
    }

    console.log("\n🚀 CERO VIDEOS PRECARGADOS + VELOCIDAD MÁXIMA + 100% CONEXIONES ACTIVAS!");
  } finally {
    await browser.close();
    server.close();
  }
}

runVerification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });
