import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Remove the HTML part
old_html = """        <!-- Uploader multimedia integrado con Vercel Serverless Function -->
        <div class="admin-field" style="border-top:1px solid var(--line);padding-top:14px;margin-top:16px;">
          <label>Subir Video/Imagen (Proxy Vercel + YourImageShare):</label>
          <input type="file" id="media-file-input" class="admin-input" accept="video/webm,video/mp4,image/*" />
          <p id="upload-status-label" style="font-size:12px;color:var(--muted);margin-top:6px;"></p>
        </div>"""

html = html.replace(old_html, "")

# Remove the JS event listener
js_target = r"const mediaInput = document\.getElementById\('media-file-input'\);.*?uploadStatus\.textContent = \"\";\s*\n\s*\}\s*\n\s*\n\s*\n\s*\n\s*\}\);"
html = re.sub(js_target, "", html, flags=re.DOTALL)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
