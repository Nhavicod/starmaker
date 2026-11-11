const fs = require("fs");

const adminHtml = fs.readFileSync("/Users/ivanelterrible/.gemini/antigravity/scratch/starleo/admin_starleo.html", "utf8");
let indexHtml = fs.readFileSync("index.html.bak_before_admin", "utf8");

// 1. Check head insertions
const headScripts = `
  <script src="https://unpkg.com/lucide@latest"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=Clash+Display:wght@500;600;700&display=swap" rel="stylesheet">
`;

if (!indexHtml.includes("lucide@latest")) {
  indexHtml = indexHtml.replace('<link rel="preconnect" href="https://fonts.googleapis.com">', headScripts + '\n  <link rel="preconnect" href="https://fonts.googleapis.com">');
}

// 2. Check admin button in header
indexHtml = indexHtml.replace(
  '<button class="admin-btn-top" id="btn-open-admin">Admin Console</button>',
  '<button class="admin-btn-top" id="btn-open-admin" onclick="openExecutiveAdmin()"><i data-lucide="crown" style="width:14px;height:14px;display:inline-block;vertical-align:middle;margin-right:6px;color:#D4AF7A"></i> Executive Console</button>'
);

console.log("Head and header button updated.");
