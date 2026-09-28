import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

side_dock_js_regex = r'const sideDock = document\.getElementById\(\'side-dock\'\);[\s\S]*?\}\s*\}, 2000\);\s*\}\);'
content = re.sub(side_dock_js_regex, '', content)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)
