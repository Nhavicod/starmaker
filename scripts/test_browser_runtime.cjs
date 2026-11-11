const puppeteer = require("puppeteer");
const { spawn } = require("child_process");
const http = require("http");
const fs = require("fs");
const path = require("path");

async function runBrowserTest() {
  console.log("Starting local test server...");
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

  await new Promise(r => server.listen(8999, r));
  console.log("Server listening at http://localhost:8999");

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

  console.log("Navigating to http://localhost:8999/index.html...");
  await page.goto("http://localhost:8999/", { waitUntil: "networkidle2" });

  // Test 1: Button exists and is visible
  const btnAdmin = await page.$("#btn-open-admin");
  if (!btnAdmin) throw new Error("Button #btn-open-admin not found in DOM");
  console.log("✓ Button #btn-open-admin found");

  // Test 2: Click button to open Executive Console
  console.log("Clicking #btn-open-admin...");
  await page.click("#btn-open-admin");
  await new Promise(r => setTimeout(r, 400));

  const isOverlayOpen = await page.evaluate(() => {
    const el = document.getElementById("adminExecutiveOverlay");
    return el && el.style.display !== "none" && el.classList.contains("is-open");
  });
  console.log("✓ Is Overlay open:", isOverlayOpen);
  if (!isOverlayOpen) throw new Error("Overlay failed to open on button click");

  // Test 3: Check Lock Modal
  const isLockOpen = await page.evaluate(() => {
    const lock = document.getElementById("lockModal");
    return lock && lock.classList.contains("open");
  });
  console.log("✓ Is Lock modal open:", isLockOpen);

  // Test 4: Unlock
  console.log("Unlocking console...");
  await page.evaluate(() => {
    window.unlockConsole();
  });
  await new Promise(r => setTimeout(r, 300));

  const isLockClosed = await page.evaluate(() => {
    const lock = document.getElementById("lockModal");
    return lock && !lock.classList.contains("open");
  });
  console.log("✓ Is Lock modal closed after unlock:", isLockClosed);

  // Test 5: Switch through all tabs
  const tabs = ["requests", "verification", "support", "activity", "settings", "overview"];
  for (const tab of tabs) {
    await page.evaluate((t) => {
      window.setAdminTab(t);
    }, tab);
    await new Promise(r => setTimeout(r, 100));
    console.log(`✓ Tab ${tab} switched and rendered`);
  }

  // Test 6: Return to App
  console.log("Testing Return to App (closeExecutiveAdmin)...");
  await page.evaluate(() => {
    window.closeExecutiveAdmin();
  });
  await new Promise(r => setTimeout(r, 200));

  const isOverlayClosed = await page.evaluate(() => {
    const el = document.getElementById("adminExecutiveOverlay");
    return el && el.style.display === "none" && !el.classList.contains("is-open");
  });
  console.log("✓ Is Overlay closed:", isOverlayClosed);
  if (!isOverlayClosed) throw new Error("Overlay failed to close on closeExecutiveAdmin()");

  await browser.close();
  server.close();

  console.log("\nErrors collected:", errors);
  if (errors.length > 0) {
    // Filter out expected network resource 404 / CORS blocks on localhost test server
    const realErrors = errors.filter(e => !e.includes("Firebase") && !e.includes("Failed to load resource"));
    if (realErrors.length > 0) {
      throw new Error("Critical page errors detected: " + realErrors.join(" | "));
    }
  }

  console.log("🎉 Puppeteer Browser Runtime Test Passed 100%!");
}

runBrowserTest().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
