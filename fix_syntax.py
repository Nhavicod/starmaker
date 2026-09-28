import re
with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

bad_if_regex = r'if \(data\.layout\) \{\s*const dockSelect = document\.getElementById\("admin-dock-style"\);\s*if \(dockSelect\) dockSelect\.value = data\.layout\.dockStyle;\s*\}'
content = re.sub(bad_if_regex, 'if (data.layout) {', content)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)
