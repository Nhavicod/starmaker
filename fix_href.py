with open("index.html", "r") as f:
    c = f.read()
c = c.replace('href="#universo"', 'href="${card.link || \'#formulario-registro\'}"')
with open("index.html", "w") as f:
    f.write(c)
