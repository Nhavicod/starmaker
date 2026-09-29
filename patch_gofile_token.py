import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Modify the image upload logic (around line 1284)
# Wait, the image upload logic was using fetch('/api/upload-image'). Let's find it.
image_logic = """          const photoUrls = [];
          for (let i = 0; i < photosInput.files.length; i++) {
            const file = photosInput.files[i];
            status.textContent = `Subiendo foto ${i + 1} de ${photosInput.files.length}...`;
            
            // Subir foto a GoFile con Token del cliente
            const srvRes = await fetch("https://api.gofile.io/servers");
            const srvData = await srvRes.json();
            const server = srvData.data.servers[0].name;
            
            const fd = new FormData();
            fd.append("file", file);
            fd.append("token", "LBRXKRTeYjMsKssLNP2ndcCb6SUi3rBP");
            
            const uploadRes = await fetch(`https://${server}.gofile.io/contents/uploadfile`, {
              method: "POST",
              body: fd
            });
            const uploadData = await uploadRes.json();
            if(uploadData.status === "ok") {
              photoUrls.push(uploadData.data.downloadPage);
            }
          }"""

html = re.sub(r'const photoUrls = \[\];.*?for\s*\(let\s*i\s*=\s*0.*?photoUrls\.push\(uploadData\.url\);\s*\}\s*\}', image_logic, html, flags=re.DOTALL)

# Now modify the Video verification logic to use the token too!
video_logic_old = """const uploadRes = await fetch(`https://${bestServer}.gofile.io/contents/uploadfile`, {
                method: "POST",
                body: formData
              });"""

video_logic_new = """formData.append("token", "LBRXKRTeYjMsKssLNP2ndcCb6SUi3rBP");
              const uploadRes = await fetch(`https://${bestServer}.gofile.io/contents/uploadfile`, {
                method: "POST",
                body: formData
              });"""

html = html.replace(video_logic_old, video_logic_new)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
