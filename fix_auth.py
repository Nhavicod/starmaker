import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# Replace openAdmin
old_open_admin = r'function openAdmin\(\) \{\s*modal\.classList\.add\("is-open"\);\s*if\(loginView\) loginView\.style\.display = "none";\s*panelView\.style\.display = "block";\s*\}'
new_open_admin = """async function openAdmin() {
      modal.classList.add("is-open");
      if(loginView) loginView.style.display = "none";
      panelView.style.display = "block";
      try {
        await signInWithEmailAndPassword(auth, "admin@starmaker.com", "Starmaker2026!");
      } catch(e) {
        console.error("Auto-login fallido: ", e);
      }
    }"""
content = re.sub(old_open_admin, new_open_admin, content)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)
