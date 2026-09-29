import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace uploadToCatbox with uploadToGoFile
old_upload = """    // Función genérica para subir a Catbox
    async function uploadToCatbox(file) {
      const formData = new FormData();
      formData.append("reqtype", "fileupload");
      formData.append("fileToUpload", file);
      
      const res = await fetch("https://catbox.moe/user/api.php", {
        method: "POST",
        body: formData
      });
      if(!res.ok) throw new Error("Error subiendo a Catbox");
      return await res.text();
    }"""

new_upload = """    // Función genérica para subir a GoFile (Directo desde el navegador, sin problemas de CORS)
    async function uploadToGoFile(file) {
      const srvRes = await fetch("https://api.gofile.io/servers");
      const srvData = await srvRes.json();
      const server = srvData.data.servers[0].name;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("token", "LBRXKRTeYjMsKssLNP2ndcCb6SUi3rBP");

      const res = await fetch(`https://${server}.gofile.io/contents/uploadfile`, {
        method: "POST",
        body: formData
      });
      
      const uploadData = await res.json();
      if (uploadData.status !== "ok") throw new Error("Error al subir a GoFile");
      
      // GoFile devuelve un downloadPage. Intentamos extraer el link directo si la API lo provee, 
      // de lo contrario usamos la página de descarga.
      return uploadData.data.downloadPage;
    }"""

html = html.replace(old_upload, new_upload)
html = html.replace('uploadToCatbox', 'uploadToGoFile')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
