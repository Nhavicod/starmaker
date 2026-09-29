import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Change .admin-modal CSS so it doesn't darken the screen, but is just a floating panel
old_css = """.admin-modal{
      display:none;position:fixed;inset:0;background:rgba(5,5,7,.85);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
      z-index:1000;align-items:center;justify-content:center;padding:18px;
    }"""

new_css = """.admin-modal{
      display:none;position:fixed;bottom:80px;right:20px;background:transparent;
      z-index:1000;align-items:flex-end;justify-content:flex-end;pointer-events:none;
    }"""

html = html.replace(old_css, new_css)

old_box = """.admin-box{
      width:100%;max-width:580px;max-height:88vh;overflow-y:auto;padding:26px;border-radius:22px;
      border:1px solid var(--line-bright);background:rgba(18,15,26,.96);box-shadow:var(--shadow);
    }"""

new_box = """.admin-box{
      width:100%;min-width:320px;max-width:580px;max-height:80vh;overflow-y:auto;padding:26px;border-radius:22px;
      border:1px solid var(--line-bright);background:rgba(18,15,26,.96);box-shadow: 0 20px 50px rgba(0,0,0,0.8); pointer-events:auto;
    }"""

html = html.replace(old_box, new_box)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
