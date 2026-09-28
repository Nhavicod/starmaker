import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# Add alert to auto-login failure
old_catch_login = r'\} catch\(e\) \{\s*console\.error\("Auto-login fallido: ", e\);\s*\}'
new_catch_login = '} catch(e) { console.error("Auto-login fallido: ", e); alert("Error de autenticación interna: " + e.message); }'
content = re.sub(old_catch_login, new_catch_login, content)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)
