import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Remove dead variables from the saveBtn.onclick logic
dead_vars = r"""            const registroVideo = document.getElementById\("admin-registro-video"\)\?\.value \|\| "";\s*const tutorials = \[\s*document.getElementById\("admin-tut-1"\)\?\.value \|\| "",\s*document.getElementById\("admin-tut-2"\)\?\.value \|\| "",\s*document.getElementById\("admin-tut-3"\)\?\.value \|\| ""\s*\];"""
html = re.sub(dead_vars, "", html, flags=re.DOTALL)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
