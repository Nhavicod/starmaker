import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# Remove the <header class="nav"> wrapper entirely and just leave the brand and the admin button.
nav_html_regex = r'<header class="nav"[^>]*>([\s\S]*?)</header>'
new_nav_html = """
    <!-- Floating Logo -->
    <a class="brand floating-brand" href="#inicio" aria-label="STARMAKER inicio">
      <span class="brand-mark" aria-hidden="true"></span>
      STARMAKER
    </a>
    
    <!-- Floating Admin Button -->
    <button type="button" class="nav-admin-btn floating-admin-btn" id="btn-open-admin">Consola Admin</button>
"""
content = re.sub(nav_html_regex, new_nav_html, content)

# Remove old .nav css
nav_css_regex = r'\.nav\{\s*position:fixed;top:18px;left:50%;transform:translateX\(-50%\);\s*width:min\(1160px,calc\(100% - 32px\)\);height:68px;\s*display:flex;align-items:center;justify-content:space-between;\s*padding:0 18px 0 22px;\s*z-index:100;\s*pointer-events: none;\s*\}\s*\.brand, \.nav-actions \{ pointer-events: auto; \}'
content = re.sub(nav_css_regex, '', content)

# Remove the media query .nav stuff
media_nav_regex = r'\.nav\{top:10px;width:calc\(100% - 20px\);height:61px\}\s*\.brand\{font-size:13px\}\s*\.nav-actions\{gap:6px\}'
content = re.sub(media_nav_regex, '', content)

# Add CSS for the floating buttons
floating_css = """
    .floating-brand {
      position: fixed;
      top: 24px;
      left: 32px;
      z-index: 1000;
    }
    .floating-admin-btn {
      position: fixed;
      top: 24px;
      right: 32px;
      z-index: 1000;
    }
    @media(max-width:620px){
      .floating-brand { top: 16px; left: 16px; font-size: 13px; }
      .floating-admin-btn { top: 16px; right: 16px; padding: 8px 11px; font-size: 11px; }
    }
"""
content = content.replace("</style>", floating_css + "\n</style>", 1)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)

