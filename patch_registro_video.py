import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Add event listener for the new Video Personaje Registro
reg_vid_js = """
    const regVideoInput = document.getElementById("admin-registro-video-file");
    if (regVideoInput) {
      regVideoInput.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if(!file) return;
        regVideoInput.parentElement.innerHTML = "⏳ SUBIENDO...";
        try {
          const url = await uploadToGoFile(file);
          await setDoc(stateDocRef, { registroVideo: url }, { merge: true });
          alert("¡Video de Registro actualizado con éxito!");
        } catch(err) {
          alert("Error al subir Video: " + err.message);
        } finally {
          location.reload();
        }
      });
    }
"""

html = html.replace('const btnModoEditor = document.getElementById("btn-modo-editor");', reg_vid_js + '\n    const btnModoEditor = document.getElementById("btn-modo-editor");')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
