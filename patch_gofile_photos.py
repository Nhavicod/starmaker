import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

target = r"          const photoUrls = \[\];.*?photoUrls\.push\(data\.url\);\n          \}"

replacement = """          const photoUrls = [];

          // Upload files to GoFile with user's token
          for(let i=0; i < Math.min(files.length, 5); i++) {
            const file = files[i];
            if (file.size > 50 * 1024 * 1024) throw new Error("Un archivo excede los 50MB"); 
            status.textContent = `Subiendo foto ${i+1} de ${Math.min(files.length, 5)} a tu cuenta segura...`;
            
            const srvRes = await fetch("https://api.gofile.io/servers");
            const srvData = await srvRes.json();
            const server = srvData.data.servers[0].name;

            const fd = new FormData();
            fd.append("file", file);
            fd.append("token", "LBRXKRTeYjMsKssLNP2ndcCb6SUi3rBP");

            const response = await fetch(`https://${server}.gofile.io/contents/uploadfile`, {
              method: "POST",
              body: fd
            });

            const data = await response.json();
            if (data.status !== "ok") throw new Error("Error al subir imagen a GoFile");
            photoUrls.push(data.data.downloadPage);
          }"""

html = re.sub(target, replacement, html, flags=re.DOTALL)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
