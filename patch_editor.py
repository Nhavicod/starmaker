import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Insert Editor CSS
editor_css = """
    /* MODO EDITOR VISUAL */
    .editor-active [contenteditable="true"] {
      outline: 2px dashed var(--cyan) !important;
      outline-offset: 4px;
      cursor: text;
      transition: outline 0.2s;
    }
    .editor-active [contenteditable="true"]:hover {
      outline: 2px solid var(--coral) !important;
      background: rgba(230, 67, 129, 0.1);
    }
    #visual-editor-toolbar {
      display: none;
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.9);
      border: 2px solid var(--cyan);
      padding: 10px 20px;
      border-radius: 30px;
      z-index: 999999;
      gap: 10px;
      align-items: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
"""
html = html.replace("  <style>", "  <style>\n" + editor_css)

# Insert Toolbar HTML right after <body>
toolbar_html = """
  <!-- TOOLBAR MODO EDITOR -->
  <div id="visual-editor-toolbar">
    <span style="color:var(--cyan); font-weight:bold; font-size:12px; letter-spacing:1px;">MODO EDITOR</span>
    <label style="background:#fff; color:#000; padding:8px 12px; border-radius:8px; font-size:12px; font-weight:bold; cursor:pointer;">
      📷 SUBIR FONDO PNG
      <input type="file" id="editor-upload-png" accept="image/png, image/jpeg" style="display:none;" />
    </label>
    <label style="background:#fff; color:#000; padding:8px 12px; border-radius:8px; font-size:12px; font-weight:bold; cursor:pointer;">
      🎥 SUBIR VIDEO LEON
      <input type="file" id="editor-upload-video" accept="video/webm, video/mp4" style="display:none;" />
    </label>
    <button id="editor-save-btn" style="background:var(--coral); color:#fff; border:none; padding:8px 12px; border-radius:8px; font-weight:bold; cursor:pointer; font-size:12px;">💾 GUARDAR TEXTOS</button>
    <button id="editor-exit-btn" style="background:transparent; color:#fff; border:1px solid #fff; padding:8px 12px; border-radius:8px; cursor:pointer; font-size:12px;">SALIR</button>
  </div>
"""
html = html.replace("<body>", "<body>\n" + toolbar_html)

# Insert Button in Admin Panel
admin_btn = """
        <button type="button" class="btn btn-primary" id="btn-modo-editor" style="background:var(--cyan); margin-top:14px; width:100%; justify-content:center;">
          ACTIVAR MODO EDITOR VISUAL (TEXTOS, PNG Y VIDEO)
        </button>
"""
html = html.replace('id="btn-save-firestore"', 'id="btn-save-firestore" style="display:none;"')
html = html.replace('GUARDAR EN FIRESTORE EN TIEMPO REAL\n        </button>', 'GUARDAR EN FIRESTORE EN TIEMPO REAL\n        </button>' + admin_btn)


# Replace old URL inputs to File inputs, Wait, we don't even need the old URL inputs if we use the Visual Editor.
# But let's keep them hidden just in case, or remove them.

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
