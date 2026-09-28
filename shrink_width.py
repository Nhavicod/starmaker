import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# Change max width of cards from 320px to 230px
old_grid = r'minmax\(0, 320px\)'
new_grid = 'minmax(0, 230px)'
content = re.sub(old_grid, new_grid, content)

# Since the card is narrower, let's adjust padding inside .card-content if necessary
# .card-content { left: 22px; right: 22px; bottom: 22px }
content = content.replace("left:22px;right:22px;bottom:22px", "left:15px;right:15px;bottom:20px")

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)
