const fs = require("fs");
const path = require("path");

const adminHtml = fs.readFileSync("/Users/ivanelterrible/.gemini/antigravity/scratch/starleo/admin_starleo.html", "utf8");
let indexHtml = fs.readFileSync("index.html.bak_before_admin", "utf8");

// 1. EXTRACT FROM ADMIN_STARLEO.HTML
const rawCss = adminHtml.match(/<style>([\s\S]*?)<\/style>/)[1];
const rawBody = adminHtml.match(/<body>([\s\S]*?)<script>/)[1];
const rawScript = adminHtml.match(/<script>([\s\S]*?)<\/script>[\s\S]*?<\/body>/)[1];

// 2. SCOPE CSS UNDER #adminExecutiveOverlay
function scopeCss(css, prefix) {
  let result = "";
  let i = 0;
  let len = css.length;

  while (i < len) {
    while (i < len && /\s/.test(css[i])) {
      result += css[i];
      i++;
    }
    if (i >= len) break;

    if (css.slice(i, i + 2) === "/*") {
      const endC = css.indexOf("*/", i + 2);
      if (endC === -1) {
        result += css.slice(i);
        break;
      }
      result += css.slice(i, endC + 2);
      i = endC + 2;
      continue;
    }

    if (css[i] === "@") {
      const braceIdx = css.indexOf("{", i);
      const semiIdx = css.indexOf(";", i);
      if (braceIdx !== -1 && (semiIdx === -1 || braceIdx < semiIdx)) {
        const atHeader = css.slice(i, braceIdx).trim();
        if (atHeader.startsWith("@keyframes")) {
          let depth = 1;
          let j = braceIdx + 1;
          while (j < len && depth > 0) {
            if (css[j] === "{") depth++;
            else if (css[j] === "}") depth--;
            j++;
          }
          result += css.slice(i, j);
          i = j;
          continue;
        } else if (atHeader.startsWith("@media")) {
          let depth = 1;
          let j = braceIdx + 1;
          while (j < len && depth > 0) {
            if (css[j] === "{") depth++;
            else if (css[j] === "}") depth--;
            j++;
          }
          const innerCss = css.slice(braceIdx + 1, j - 1);
          result += atHeader + " {\n" + scopeCss(innerCss, prefix) + "\n}";
          i = j;
          continue;
        }
      }
    }

    const braceOpen = css.indexOf("{", i);
    if (braceOpen === -1) {
      result += css.slice(i);
      break;
    }
    const selectorStr = css.slice(i, braceOpen).trim();
    let depth = 1;
    let j = braceOpen + 1;
    while (j < len && depth > 0) {
      if (css[j] === "{") depth++;
      else if (css[j] === "}") depth--;
      j++;
    }
    const bodyStr = css.slice(braceOpen + 1, j - 1);

    if (selectorStr === ":root") {
      result += prefix + " {" + bodyStr + "}";
    } else if (selectorStr === "html" || selectorStr === "body" || selectorStr === "*") {
      result += "/* " + selectorStr + " */\n";
    } else {
      const scopedSelectors = selectorStr.split(",").map(s => {
        s = s.trim();
        if (!s) return "";
        return prefix + " " + s;
      }).filter(Boolean).join(", ");
      result += scopedSelectors + " {" + bodyStr + "}";
    }
    i = j;
  }
  return result;
}

const scopedCss = `
/* ════════════════════════════════════════════════════════════════════ */
/* EXECUTIVE COMMAND SUITE (ADMIN STARLEO) SCOPED STYLES               */
/* ════════════════════════════════════════════════════════════════════ */
@keyframes rise {
  from { opacity: 0; transform: translateY(18px) scale(0.985); }
  to { opacity: 1; transform: none; }
}
@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 8px 28px rgba(var(--neon-rgb, 212, 175, 122), 0.22), inset 0 1px 0 rgba(255,255,255,0.25); }
  50% { box-shadow: 0 12px 36px rgba(var(--neon-rgb, 212, 175, 122), 0.38), inset 0 1px 0 rgba(255,255,255,0.35); }
}

#adminExecutiveOverlay {
  --bg: radial-gradient(circle at 15% 0%, rgba(212, 175, 122, 0.08) 0%, transparent 45%),
        radial-gradient(circle at 85% 15%, rgba(148, 130, 219, 0.06) 0%, transparent 45%),
        linear-gradient(180deg, #06070a 0%, #0a0c12 50%, #050608 100%);
  --surface: rgba(16, 19, 28, 0.78);
  --surface2: rgba(24, 28, 40, 0.72);
  --line: rgba(255, 255, 255, 0.07);
  --line-strong: rgba(212, 175, 122, 0.28);
  --text: #f4f5f8;
  --muted: #8b92a5;
  --primary: #D4AF7A;
  --cyan: #E6C89C;
  --pink: #B892FF;
  --green: #45D09E;
  --yellow: #E8B960;
  --danger: #E06C75;
  --radius: 20px;
  --shadow: 0 24px 60px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.07);
  --bg-color: #06070a;
  --card-color: #10131c;
  --neon: #D4AF7A;
  --neon-rgb: 212, 175, 122;

  position: fixed;
  inset: 0;
  z-index: 100000;
  background: var(--bg);
  background-attachment: fixed;
  color: var(--text);
  font-family: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  line-height: 1.55;
  overflow-x: hidden;
  overflow-y: auto;
  display: none;
  -webkit-font-smoothing: antialiased;
}
#adminExecutiveOverlay.is-open {
  display: block;
}
#adminExecutiveOverlay * {
  box-sizing: border-box;
}
#adminExecutiveOverlay button,
#adminExecutiveOverlay input,
#adminExecutiveOverlay select,
#adminExecutiveOverlay textarea {
  font: inherit;
}
#adminExecutiveOverlay button,
#adminExecutiveOverlay a {
  touch-action: manipulation;
}
#adminExecutiveOverlay a {
  color: inherit;
  text-decoration: none;
}
#adminExecutiveOverlay .hidden {
  display: none !important;
}

${scopeCss(rawCss, "#adminExecutiveOverlay")}
`;

console.log("Scoped CSS size:", scopedCss.length);
