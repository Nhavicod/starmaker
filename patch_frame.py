import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

old_css = r"""    .slideshow-container \{
      width: min\(390px, 72vw\);
      aspect-ratio: 1;
      position: relative;
      overflow: hidden;
      border-radius: 50%;
      box-shadow: inset -45px -30px 80px rgba\(0,0,0,\.75\), 0 0 70px rgba\(230,67,129,\.16\);
    \}
    \.slideshow-container::before \{
      content: ""; position: absolute; inset: -22px;
      border: 1px solid rgba\(235,82,121,\.35\);
      border-radius: 50%; transform: rotate\(-22deg\) scaleY\(\.27\);
      box-shadow: 0 0 35px rgba\(235,82,121,\.18\); pointer-events: none; z-index: 10;
    \}"""

new_css = """    .slideshow-container {
      width: min(390px, 72vw);
      aspect-ratio: 1;
      position: relative;
      overflow: visible;
    }"""

content = re.sub(old_css, new_css, content)

# Since the images are PNGs without background, we also might want background-size: contain
# so they don't get cut off if they are meant to be characters.
content = content.replace("background-size: cover;", "background-size: contain; background-repeat: no-repeat;")

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)

