const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

async function runTest() {
  console.log("Starting test server...");
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

  await new Promise(r => server.listen(8996, r));
  console.log("Test server running at http://localhost:8996");

  const errors = [];
  const logs = [];

  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  page.on("pageerror", err => errors.push(err.message));
  page.on("console", msg => {
    if (msg.type() === "error") errors.push(msg.text());
    else logs.push(msg.text());
  });

  await page.goto("http://localhost:8996/", { waitUntil: "networkidle2" });

  console.log("\n--- TEST 1: Header Buttons Presence ---");
  const hasMascotBtn = await page.$("#btn-open-mascot");
  const hasAdminBtn = await page.$("#btn-open-admin");
  console.log("Mascot button present:", !!hasMascotBtn);
  console.log("Admin button present:", !!hasAdminBtn);
  if (!hasMascotBtn || !hasAdminBtn) throw new Error("Header buttons missing");

  console.log("\n--- TEST 2: Floating Mascot Widget Toggle & Content ---");
  await page.click("#btn-open-mascot");
  await new Promise(r => setTimeout(r, 200));

  const mascotWidgetStatus = await page.evaluate(() => {
    const el = document.getElementById("mascot-widget");
    const config = document.getElementById("admin-portals-config");
    return {
      open: el && el.classList.contains("is-open") && el.style.display !== "none",
      hasPortalsConfig: config && config.children.length > 0,
      portalCount: config ? config.children.length : 0
    };
  });
  console.log("Mascot widget status:", mascotWidgetStatus);
  if (!mascotWidgetStatus.open) throw new Error("Mascot widget failed to open on button click");
  if (!mascotWidgetStatus.hasPortalsConfig || mascotWidgetStatus.portalCount !== 3) {
    throw new Error("Mascot widget missing 3 portal controls");
  }

  // Close mascot widget
  await page.click("#btn-close-mascot");
  await new Promise(r => setTimeout(r, 200));
  const isMascotClosed = await page.evaluate(() => {
    const el = document.getElementById("mascot-widget");
    return el && !el.classList.contains("is-open") && el.style.display === "none";
  });
  console.log("Mascot widget closed properly:", isMascotClosed);
  if (!isMascotClosed) throw new Error("Mascot widget failed to close");

  console.log("\n--- TEST 3: Live Mascot Spatial Slider on Showroom Stage ---");
  // Test changing slider X on portal 1
  await page.evaluate(() => {
    window.liveTransform(1);
    const sl = document.getElementById("sl-x-1");
    if (sl) {
      sl.value = 55;
      window.liveTransform(1);
    }
  });
  const rootVarX = await page.evaluate(() => {
    return document.documentElement.style.getPropertyValue("--vp1-x");
  });
  console.log("Live CSS var --vp1-x updated to:", rootVarX);
  if (rootVarX !== "55px") throw new Error("Live transform failed to update --vp1-x");

  console.log("\n--- TEST 4: Clean Streamlined Admin Panel (Direct Access without Lock) ---");
  await page.click("#btn-open-admin");
  await new Promise(r => setTimeout(r, 200));

  const lockModalExists = await page.evaluate(() => {
    return !!document.getElementById("lockModal");
  });
  console.log("Lock modal exists in DOM:", lockModalExists);
  if (lockModalExists) throw new Error("lockModal should be completely removed from DOM");

  const adminStatus = await page.evaluate(() => {
    const overlay = document.getElementById("adminExecutiveOverlay");
    return overlay && overlay.classList.contains("is-open") && overlay.style.display !== "none";
  });
  console.log("Admin overlay open:", adminStatus);
  if (!adminStatus) throw new Error("Admin overlay failed to open");

  // Verify all 5 streamlined tabs render without errors
  const cleanTabs = ["overview", "requests", "tutorials", "support", "settings"];
  for (const t of cleanTabs) {
    await page.evaluate((tab) => {
      window.setAdminTab(tab);
    }, t);
    await new Promise(r => setTimeout(r, 100));

    const viewHtml = await page.evaluate(() => {
      const v = document.getElementById("adminView");
      return v ? v.innerHTML.length : 0;
    });
    console.log(`✓ Tab ${t} rendered successfully (${viewHtml} chars)`);
    if (viewHtml === 0) throw new Error(`Tab ${t} rendered empty`);
  }

  // Close Admin Panel and return to app
  await page.evaluate(() => {
    window.closeExecutiveAdmin();
  });
  await new Promise(r => setTimeout(r, 200));

  const isOverlayClosed = await page.evaluate(() => {
    const overlay = document.getElementById("adminExecutiveOverlay");
    return overlay && !overlay.classList.contains("is-open") && overlay.style.display === "none";
  });
  console.log("Admin overlay closed and returned to app:", isOverlayClosed);
  if (!isOverlayClosed) throw new Error("Failed to close admin overlay");

  await browser.close();
  server.close();

  console.log("\nErrors collected:", errors);
  const realErrors = errors.filter(e => !e.includes("Firebase") && !e.includes("Failed to load resource"));
  if (realErrors.length > 0) {
    throw new Error("Critical page errors detected: " + realErrors.join(" | "));
  }

  console.log("\n🏆 ALL TESTS PASSED WITH 100% SUCCESS!");
  process.exit(0);
}

runTest().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
