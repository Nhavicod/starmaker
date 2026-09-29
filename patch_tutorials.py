import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace text inputs with file inputs in the Admin Panel
tut_inputs_old = """          <input type="text" class="admin-input" id="admin-tut-1" placeholder="URL Video 1" style="margin-bottom: 6px;" />
          <input type="text" class="admin-input" id="admin-tut-2" placeholder="URL Video 2" style="margin-bottom: 6px;" />
          <input type="text" class="admin-input" id="admin-tut-3" placeholder="URL Video 3" style="margin-bottom: 6px;" />"""

tut_inputs_new = """          <label style="background:var(--cyan);color:#000;padding:8px;border-radius:4px;display:block;margin-bottom:6px;cursor:pointer;font-weight:bold;text-align:center;">SUBIR TUTORIAL 1<input type="file" id="admin-tut-1-file" accept="video/*" style="display:none;" /></label>
          <label style="background:var(--cyan);color:#000;padding:8px;border-radius:4px;display:block;margin-bottom:6px;cursor:pointer;font-weight:bold;text-align:center;">SUBIR TUTORIAL 2<input type="file" id="admin-tut-2-file" accept="video/*" style="display:none;" /></label>
          <label style="background:var(--cyan);color:#000;padding:8px;border-radius:4px;display:block;margin-bottom:6px;cursor:pointer;font-weight:bold;text-align:center;">SUBIR TUTORIAL 3<input type="file" id="admin-tut-3-file" accept="video/*" style="display:none;" /></label>"""

html = html.replace(tut_inputs_old, tut_inputs_new)

# Add event listeners for these 3 inputs inside the editor JS block
event_listeners = """
    ['admin-tut-1-file', 'admin-tut-2-file', 'admin-tut-3-file'].forEach((id, index) => {
      const input = document.getElementById(id);
      if (input) {
        input.addEventListener('change', async (e) => {
          const file = e.target.files[0];
          if(!file) return;
          const oldLabel = input.parentElement.innerHTML;
          input.parentElement.innerHTML = "⏳ SUBIENDO...";
          try {
            const url = await uploadToCatbox(file);
            const key = 'tut' + (index + 1); // e.g. tut1, tut2, tut3
            await setDoc(stateDocRef, { [key]: url }, { merge: true });
            alert("Tutorial " + (index+1) + " subido con éxito!");
          } catch(err) {
            alert("Error: " + err.message);
          } finally {
            location.reload();
          }
        });
      }
    });
"""

html = html.replace('// Todos los elementos de texto que queremos que sean editables', event_listeners + '\n    // Todos los elementos de texto que queremos que sean editables')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
