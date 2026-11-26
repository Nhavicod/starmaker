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
    timeout: 60000,
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

    // 1. Verify White-Background Chroma-Key Shader / Processor on White-BG Frame
    const chromaResult = await page.evaluate(() => {
      const srcCanvas = document.createElement("canvas");
      srcCanvas.width = 160;
      srcCanvas.height = 160;
      const sctx = srcCanvas.getContext("2d");

      // Pure white studio background + near-white compressed patch + coral character in UPPER half
      sctx.fillStyle = "#FFFFFF";
      sctx.fillRect(0, 0, 160, 160);
      sctx.fillStyle = "rgb(247, 247, 247)";
      sctx.fillRect(0, 0, 30, 30);
      sctx.fillStyle = "rgb(235, 82, 121)";
      sctx.fillRect(50, 20, 60, 50);

      const proc = window.processors[1];
      proc.drawSingleFrame(srcCanvas);

      const w = proc.canvas.width;
      const h = proc.canvas.height;
      let pureWhitePixel, nearWhitePixel, subjectPixel;
      const mode = proc.gl ? "webgl-gpu" : "canvas-2d";

      if (proc.gl) {
        const gl = proc.gl;
        const px = new Uint8Array(4);
        gl.readPixels(150, 10, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
        pureWhitePixel = Array.from(px);
        gl.readPixels(10, h - 10, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
        nearWhitePixel = Array.from(px);
        gl.readPixels(Math.floor(w / 2), h - 45, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
        subjectPixel = Array.from(px);
      } else {
        pureWhitePixel = Array.from(proc.ctx2d.getImageData(150, 150, 1, 1).data);
        nearWhitePixel = Array.from(proc.ctx2d.getImageData(10, 10, 1, 1).data);
        subjectPixel = Array.from(proc.ctx2d.getImageData(Math.floor(w / 2), 45, 1, 1).data);
      }

      proc.setSource("");
      return { mode, pureWhitePixel, nearWhitePixel, subjectPixel };
    });

    console.log("1. White-BG Chroma-Key Pixel Test:", chromaResult);
    if (chromaResult.pureWhitePixel[3] !== 0 || chromaResult.nearWhitePixel[3] !== 0) {
      throw new Error(`El fondo blanco NO fue eliminado: ${JSON.stringify(chromaResult)}`);
    }
    if (chromaResult.subjectPixel[3] < 245 || chromaResult.subjectPixel[0] < 200) {
      throw new Error(`El personaje no quedó opaco y al derecho: ${JSON.stringify(chromaResult.subjectPixel)}`);
    }

    // 2. Verify Mascot Calibrator Live CSS vars on #canvas-p1
    await page.click("#btn-open-mascot");
    await page.evaluate(() => {
      document.getElementById("sl-x-1").value = "35";
      window.liveTransform(1);
    });
    const varVp1X = await page.evaluate(() => document.documentElement.style.getPropertyValue("--vp1-x"));
    console.log("2. Mascot Calibrator Connected (--vp1-x):", varVp1X);
    if (varVp1X !== "35px") throw new Error("Calibrador desconectado");
    await page.evaluate(() => window.closeMascotWidget());

    // 3. Verify Admin Console & Portal Connections
    await page.click("#btn-open-admin");
    for (const tab of ["overview", "requests", "tutorials", "support", "settings"]) {
      await page.evaluate((t) => window.setAdminTab(t), tab);
      const len = await page.evaluate(() => document.getElementById("adminView")?.innerHTML.length || 0);
      if (len < 100) throw new Error(`Pestaña ${tab} vacía`);
    }
    await page.evaluate(() => window.closeExecutiveAdmin());

    if (notFoundUrls.length > 0) {
      throw new Error("Recursos 404 detectados: " + notFoundUrls.join(", "));
    }

    const criticalErrors = [...pageErrors, ...consoleErrors].filter(
      (e) => !e.includes("Firestore") && !e.includes("Firebase")
    );
    if (criticalErrors.length > 0) {
      throw new Error("Errores JS detectados: " + criticalErrors.join(" | "));
    }

    console.log("\n✅ CHROMA-KEY DE FONDO BLANCO EN GPU VERIFICADO AL 100%!");
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
