with open("index.html", "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
for idx, line in enumerate(lines):
    # CSS block
    if 437 <= idx <= 503:
        continue
    # HTML block
    if 513 <= idx <= 518:
        continue
    new_lines.append(line)

with open("index.html", "w", encoding="utf-8") as f:
    f.writelines(new_lines)
