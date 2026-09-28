import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# Make openAdmin bypass login again
old_open_admin = r'function openAdmin\(\) \{\s*modal\.classList\.add\("is-open"\);\s*if\(loginView\) loginView\.style\.display = "block";\s*panelView\.style\.display = "none";\s*\}'
new_open_admin = """function openAdmin() {
      modal.classList.add("is-open");
      if(loginView) loginView.style.display = "none";
      panelView.style.display = "block";
    }"""
content = re.sub(old_open_admin, new_open_admin, content)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)
