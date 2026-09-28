import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# Restore the login logic in openAdmin
old_open_admin = r'function openAdmin\(\) \{\s*modal\.classList\.add\("is-open"\);\s*if\(loginView\) loginView\.style\.display = "none";\s*panelView\.style\.display = "block";\s*\}'
new_open_admin = """function openAdmin() {
      modal.classList.add("is-open");
      if(loginView) loginView.style.display = "block";
      panelView.style.display = "none";
    }"""
content = re.sub(old_open_admin, new_open_admin, content)

# Change the default email in the form
content = content.replace('value="admin@starmaker.com"', 'value="sosbamban@gmail.com"')

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)
