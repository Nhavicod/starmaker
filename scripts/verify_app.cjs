const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

async function runVerification() {
  const distDir = path.join(__dirname, "..", "dist");
  if (!fs.existsSync(path.join(distDir, "index.html"))) {
    throw new Error("dist/index.html no existe. Ejecuta 'npm run build' primero.");
  }

  const mimeMap = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".webm": "video/webm",
    ".mp4": "video/mp4"
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

    // 1. Showroom & Trackpad Integrity
    const showroomCheck = await page.evaluate(() => ({
      hasMascotBtn: Boolean(document.getElementById("btn-open-mascot")),
      hasAdminBtn: Boolean(document.getElementById("btn-open-admin")),
      hasAutoProgress: Boolean(document.getElementById("capsule-auto-progress")),
      noLockModal: !document.getElementById("lockModal"),
      vid1Src: document.getElementById("vid-p1")?.getAttribute("src") || ""
    }));
    console.log("1. Showroom Check:", showroomCheck);
    if (!showroomCheck.hasMascotBtn || !showroomCheck.hasAdminBtn || !showroomCheck.hasAutoProgress || !showroomCheck.noLockModal) {
      throw new Error("Fallo en elementos base del Showroom");
    }
    if (!showroomCheck.vid1Src) {
      throw new Error("Mascota Portal 1 no tiene fuente de video asignada");
    }

    // 2. Mascot Calibrator Live Connection
    await page.click("#btn-open-mascot");
    await page.evaluate(() => {
      const slX = document.getElementById("sl-x-1");
      slX.value = "45";
      window.liveTransform(1);
    });
    const varVp1X = await page.evaluate(() => document.documentElement.style.getPropertyValue("--vp1-x"));
    console.log("2. Mascot Live Transform (--vp1-x):", varVp1X);
    if (varVp1X !== "45px") throw new Error("Calibrador de mascota no actualizó --vp1-x");
    await page.evaluate(() => window.closeMascotWidget());

    // 3. Executive Admin & Pinned/Sunken Sleepable Widgets
    await page.click("#btn-open-admin");
    const pinSleepCheck = await page.evaluate(() => {
      window.togglePin("w-kpi");
      const isSunken = document.getElementById("w-kpi")?.classList.contains("sunken");
      window.wakeWidget("w-kpi");
      const isAwake = document.getElementById("w-kpi")?.classList.contains("pinned") && !document.getElementById("w-kpi")?.classList.contains("sunken");
      return { isSunken, isAwake };
    });
    console.log("3. Widget Sleep/Awake Check:", pinSleepCheck);
    if (!pinSleepCheck.isSunken || !pinSleepCheck.isAwake) {
      throw new Error("Fallo en la mecánica de widgets prendidos/dormidos");
    }

    // 4. All 5 Admin Tabs + Status Cards & Dossier Drawer
    const tabs = ["overview", "requests", "tutorials", "support", "settings"];
    for (const tab of tabs) {
      await page.evaluate((t) => window.setAdminTab(t), tab);
      const len = await page.evaluate(() => document.getElementById("adminView")?.innerHTML.length || 0);
      if (len < 100) throw new Error(`Pestaña ${tab} renderizó vacía`);
    }
    console.log("4. Pestañas Admin verificadas (5/5)");

    // 5. Bi-directional Sync: Admin Tutorial -> Portal 2 Academy & Modal (Zero Rickroll)
    const tutorialSync = await page.evaluate(() => {
      window.setAdminTab("tutorials");
      document.getElementById("tutTitle").value = "Masterclass Audio Pro";
      document.getElementById("tutDesc").value = "Configuración sin eco";
      document.getElementById("tutUrlInput").value = "/LEON2.mp4";
      window.addTutorialByUrl();
      window.closeExecutiveAdmin();

      const portal2Html = document.getElementById("tutoriales-catalog")?.innerHTML || "";
      window.abrirRecursoAcademia(0);
      const modalBody = document.getElementById("modal-video-body")?.innerHTML || "";
      window.cerrarVideoModal();
      return {
        inPortal2: portal2Html.includes("Masterclass Audio Pro"),
        hasVideoPlayer: modalBody.includes("<video") && !modalBody.includes("dQw4w9WgXcQ")
      };
    });
    console.log("5. Conexión Admin -> Portal 2 Academia:", tutorialSync);
    if (!tutorialSync.inPortal2 || !tutorialSync.hasVideoPlayer) {
      throw new Error("Fallo en conexión entre Admin Tutoriales y Portal 2");
    }

    // 6. Bi-directional Sync: Admin Support & Socials -> Portal 3 + Public Ticket -> Admin
    const supportSync = await page.evaluate(async () => {
      window.openExecutiveAdmin();
      window.setAdminTab("support");
      window.editSupport(0, "name", "Asesor VIP Directo");
      window.setAdminTab("settings");
      window.updateSocial("instagram", "https://instagram.com/starmaker_oficial");
      window.closeExecutiveAdmin();

      // Create ticket from Portal 3 public form
      document.getElementById("pt-name").value = "@luna_singer";
      document.getElementById("pt-msg").value = "Solicitud de verificación prioritaria";
      await window.submitPublicTicket({ preventDefault() {}, target: { reset() {} } });

      return {
        advisorInPortal3: document.getElementById("soporte-list")?.innerHTML.includes("Asesor VIP Directo"),
        socialInPortal3: document.getElementById("portal-socials-bar")?.innerHTML.includes("starmaker_oficial"),
        ticketInAdmin: window.adminExecutiveState.tickets.some((t) => t.name === "@luna_singer")
      };
    });
    console.log("6. Conexión Bidireccional Portal 3 <-> Admin:", supportSync);
    if (!supportSync.advisorInPortal3 || !supportSync.socialInPortal3 || !supportSync.ticketInAdmin) {
      throw new Error("Fallo en conexión bidireccional de Portal 3 y Admin");
    }

    if (notFoundUrls.length > 0) {
      throw new Error("Recursos 404 detectados: " + notFoundUrls.join(", "));
    }

    const criticalErrors = [...pageErrors, ...consoleErrors].filter(
      (e) => !e.includes("Firestore") && !e.includes("Firebase")
    );
    if (criticalErrors.length > 0) {
      throw new Error("Errores JS en consola: " + criticalErrors.join(" | "));
    }

    console.log("\n✅ VERIFICACIÓN E2E COMPLETADA AL 100% (0 ERRORES, 0 ENLACES 404)!");
  } finally {
    await browser.close();
    server.close();
  }
}

runVerification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Verificación fallida:", err);
    process.exit(1);
  });
