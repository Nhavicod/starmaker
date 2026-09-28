import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

bad_js_regex = r'<script>\s*let scrollTimeout;[\s\S]*?\}\s*</script>'
content = re.sub(bad_js_regex, '', content)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)
