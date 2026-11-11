const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

async function runDeepSyncTest() {
  console.log("Starting local test server for deep sync test...");
  const server = http.createServer((req, res) => {
    let filePath = req.url === "/" ? "index.html" : req.url.slice(1);
    filePath = path.join(__dirname, "..", filePath.split("?")[0]);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      const mime = {
        ".html": "text/html",
        ".js": "application/javascript",
        ".css": "text/css",
        ".json": "application/json"
      }[ext] || "text/plain";
      res.writeHead(200, { "Content-Type": mime });
      res.end(fs.readFileSync(filePath));
    } else {
      res.writeHead(404);
      res.end("Not Found");
    }
  });

  await new Promise(r => server.listen(8997, r));
  console.log("Server listening at http://localhost:8997");

  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  await page.goto("http://localhost:8997/", { waitUntil: "networkidle2" });

  console.log("\n--- TEST 1: Mascot Spatial Calibration to Live CSS Vars ---");
  const initialX = await page.evaluate(() => {
    return document.documentElement.style.getPropertyValue("--vp1-x");
  });
  console.log("Initial --vp1-x:", initialX || "(unset)");

  await page.evaluate(() => {
    window.previewMascot("streamer", "x", 45);
    window.previewMascot("streamer", "y", -30);
    window.previewMascot("streamer", "scale", 140);
  });

  const calibrated = await page.evaluate(() => ({
    x: document.documentElement.style.getPropertyValue("--vp1-x"),
    y: document.documentElement.style.getPropertyValue("--vp1-y"),
    s: document.documentElement.style.getPropertyValue("--vp1-s")
  }));
  console.log("Calibrated vars:", calibrated);
  if (calibrated.x !== "45px" || calibrated.y !== "-30px" || calibrated.s !== "1.4") {
    throw new Error("Mascot calibration CSS sync failed: " + JSON.stringify(calibrated));
  }
  console.log("✓ TEST 1 PASSED: Live CSS variables reactively updated on Showroom!");

  console.log("\n--- TEST 2: Tutorial Sync to Portal 2 ---");
  await page.evaluate(() => {
    window.adminExecutiveState.tutorials = [
      { title: "Masterclass Iluminación 4K", desc: "Guía Pro", type: "video", url: "https://example.com/tut1.mp4" },
      { title: "Reglamento Oficial PDF", desc: "Documento oficial", type: "pdf", url: "https://example.com/doc.pdf" }
    ];
    window.syncTutorialsToPortal();
  });

  const tutHtml = await page.evaluate(() => {
    const el = document.getElementById("tutoriales-list");
    return el ? el.innerHTML : "";
  });
  console.log("Tutorials list length:", tutHtml.length);
  if (!tutHtml.includes("Masterclass Iluminación 4K") || !tutHtml.includes("Reglamento Oficial PDF")) {
    throw new Error("Tutorials failed to render into #tutoriales-list");
  }
  console.log("✓ TEST 2 PASSED: Tutorials library dynamically synchronized with Portal 2!");

  console.log("\n--- TEST 3: Support Directory Sync to Portal 3 ---");
  await page.evaluate(() => {
    window.adminExecutiveState.supportContacts = [
      { id: "oficial_vip", name: "Directora Valentina", role: "Atención VIP", whatsapp: "+52 55 9999 8888" }
    ];
    window.syncSupportToPortal();
  });

  const supHtml = await page.evaluate(() => {
    const el = document.getElementById("soporte-list");
    return el ? el.innerHTML : "";
  });
  console.log("Support list content:", supHtml);
  if (!supHtml.includes("Directora Valentina") || !supHtml.includes("525599998888")) {
    throw new Error("Support contact failed to render into #soporte-list");
  }
  console.log("✓ TEST 3 PASSED: Concierge contacts dynamically synchronized with Portal 3!");

  console.log("\n--- TEST 4: Candidate Dossier Management ---");
  await page.evaluate(() => {
    // Open console and create a new candidate
    window.openExecutiveAdmin();
    window.unlockConsole();
    document.getElementById("nrName").value = "Leonardo DiCaprio";
    document.getElementById("nrUser").value = "@leo_official";
    document.getElementById("nrCountry").value = "México";
    document.getElementById("nrStatus").value = "EN REVISIÓN";
    document.getElementById("nrVideoUrl").value = "https://example.com/leo.mp4";
    window.createNewRequest();
  });

  const hasNewCandidate = await page.evaluate(() => {
    const found = window.adminExecutiveState.requests.find(r => r.name === "Leonardo DiCaprio");
    return !!found;
  });
  console.log("Candidate created in state:", hasNewCandidate);
  if (!hasNewCandidate) throw new Error("Candidate creation failed");

  // Filter requests
  await page.evaluate(() => {
    window.setAdminTab("requests");
    window.setReqSearch("Leonardo");
  });

  const filteredHtml = await page.evaluate(() => {
    const el = document.getElementById("filteredRequestsList");
    return el ? el.innerHTML : "";
  });
  console.log("Filtered request search found candidate:", filteredHtml.includes("Leonardo DiCaprio"));
  if (!filteredHtml.includes("Leonardo DiCaprio")) throw new Error("Search filter failed to locate candidate");
  console.log("✓ TEST 4 PASSED: Talent Onboarding and search filter verified!");

  console.log("\n--- TEST 5: CSV Export function ---");
  const canExportCsv = await page.evaluate(() => {
    return typeof window.exportCandidatesCsv === "function";
  });
  console.log("exportCandidatesCsv is available:", canExportCsv);
  if (!canExportCsv) throw new Error("exportCandidatesCsv function missing");
  console.log("✓ TEST 5 PASSED: CSV export utility ready!");

  await browser.close();
  server.close();
  console.log("\n🏆 ALL 5 DEEP INTEGRATION TESTS PASSED 100%!");
}

runDeepSyncTest().catch(err => {
  console.error("Deep test failed:", err);
  process.exit(1);
});
