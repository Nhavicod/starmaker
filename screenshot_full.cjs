const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  page.on('response', r => { if(!r.ok()) console.log('FAILED:', r.status(), r.url()); });
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  await page.setViewport({ width: 1280, height: 1080 });
  await page.goto('https://starmaker-two.vercel.app', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 4000));
  const videoExists = await page.$eval('video', v => !!v).catch(() => false);
  const videoSrc = await page.$eval('video', v => v.src).catch(() => null);
  console.log('Video exists:', videoExists, 'src:', videoSrc);
  await page.screenshot({ path: 'screenshot_full.png', fullPage: true });
  await browser.close();
})();
