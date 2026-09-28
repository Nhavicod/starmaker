import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# Fix max-width:900px
old_900 = r'\.cards\{grid-template-columns:1fr 1fr\}'
new_900 = '.cards{grid-template-columns:repeat(2, minmax(0, 230px));justify-content:center}'
content = re.sub(old_900, new_900, content)

# Fix max-width:620px
old_620 = r'\.cards\{grid-template-columns:1fr\}'
new_620 = '.cards{grid-template-columns:minmax(0, 230px);justify-content:center}'
content = re.sub(old_620, new_620, content)

# Also let's standardize the mobile card height to be identical to desktop so the aspect ratio doesn't warp for their video.
# Mobile height was 340px, desktop is 370px.
old_mobile_height = r'\.card\{min-height:340px\}'
new_mobile_height = '.card{min-height:370px}'
content = re.sub(old_mobile_height, new_mobile_height, content)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)
