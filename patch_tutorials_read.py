import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Change the onSnapshot listener to read tut1, tut2, tut3 as well as data.tutorials
old_tuts = r"""          if \(data\.tutorials\) \{
            if \(document\.getElementById\("admin-tut-1"\)\) document\.getElementById\("admin-tut-1"\)\.value = data\.tutorials\[0\] \|\| "";
            if \(document\.getElementById\("admin-tut-2"\)\) document\.getElementById\("admin-tut-2"\)\.value = data\.tutorials\[1\] \|\| "";
            if \(document\.getElementById\("admin-tut-3"\)\) document\.getElementById\("admin-tut-3"\)\.value = data\.tutorials\[2\] \|\| "";
            
            const tutList = document\.getElementById\("tutoriales-list"\);
            if \(tutList\) \{
              tutList\.innerHTML = data\.tutorials\.map\(url => \{
                if\(!url\) return '';
                return `<div style="background: rgba\(0,0,0,0.5\); padding: 12px; border-radius: 12px;"><a href="\$\{url\}" target="_blank" style="color: var\(--coral\);">Ver Tutorial ↗</a></div>`;
              \}\)\.join\(""\);
            \}
          \}"""

new_tuts = """          const tuts = data.tutorials || [];
          if (data.tut1) tuts[0] = data.tut1;
          if (data.tut2) tuts[1] = data.tut2;
          if (data.tut3) tuts[2] = data.tut3;

          if (tuts.length > 0) {
            if (document.getElementById("admin-tut-1")) document.getElementById("admin-tut-1").value = tuts[0] || "";
            if (document.getElementById("admin-tut-2")) document.getElementById("admin-tut-2").value = tuts[1] || "";
            if (document.getElementById("admin-tut-3")) document.getElementById("admin-tut-3").value = tuts[2] || "";
            
            const tutList = document.getElementById("tutoriales-list");
            if (tutList) {
              tutList.innerHTML = tuts.map(url => {
                if(!url) return '';
                return `<div style="background: rgba(0,0,0,0.5); padding: 12px; border-radius: 12px;"><a href="${url}" target="_blank" style="color: var(--coral);">Ver Tutorial ↗</a></div>`;
              }).join("");
            }
          }"""

html = re.sub(old_tuts, new_tuts, html, flags=re.DOTALL)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
