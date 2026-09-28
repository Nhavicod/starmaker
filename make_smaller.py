import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update .cards grid
old_cards = r'\.cards\{display:grid;grid-template-columns:repeat\(3,1fr\);gap:18px\}'
new_cards = '.cards{display:grid;grid-template-columns:repeat(3, minmax(0, 320px));justify-content:center;gap:24px}'
content = re.sub(old_cards, new_cards, content)

# 2. Update .card min-height
old_card_height = r'position:relative;min-height:450px;overflow:hidden;'
new_card_height = 'position:relative;min-height:370px;overflow:hidden;'
content = re.sub(old_card_height, new_card_height, content)

# 3. Update .card min-height in mobile media queries if needed
old_mobile_height = r'\.card\{min-height:410px\}'
new_mobile_height = '.card{min-height:340px}'
content = re.sub(old_mobile_height, new_mobile_height, content)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)
