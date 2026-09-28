import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

old_config_regex = r'const firebaseConfig = \{[\s\S]*?\};'
new_config = """const firebaseConfig = {
      apiKey: "AIzaSyC3iwfeStY1ANVcGIsH8rJD-8rJ5n_p_fE",
      authDomain: "starmaker-505b7.firebaseapp.com",
      projectId: "starmaker-505b7",
      storageBucket: "starmaker-505b7.firebasestorage.app",
      messagingSenderId: "52809712878",
      appId: "1:52809712878:web:49c92142f243a951a5dfff",
      measurementId: "G-MYD1M5XRTY"
    };"""

content = re.sub(old_config_regex, new_config, content)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)
