const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto('https://starmaker-two.vercel.app', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 3000)); // wait for video to load
  await page.screenshot({ path: 'screenshot.png' });
  await browser.close();
})();
