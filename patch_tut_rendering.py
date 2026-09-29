import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace the tutorial rendering logic in onSnapshot
tut_logic_old = """          if (data.tutorials) {
            if (document.getElementById("admin-tut-1")) document.getElementById("admin-tut-1").value = data.tutorials[0] || "";
            if (document.getElementById("admin-tut-2")) document.getElementById("admin-tut-2").value = data.tutorials[1] || "";
            if (document.getElementById("admin-tut-3")) document.getElementById("admin-tut-3").value = data.tutorials[2] || "";
            
            const tutList = document.getElementById("tutoriales-list");
            if (tutList) {
              tutList.innerHTML = data.tutorials.map((link, i) => {
                if(!link) return '';
                // Soporte para links de YouTube embebidos o links directos
                if(link.includes("youtube.com") || link.includes("youtu.be")) {
                  let embedUrl = link.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/");
                  return `<iframe width="100%" height="250" style="border-radius:12px; margin-bottom: 24px;" src="${embedUrl}" frameborder="0" allowfullscreen></iframe>`;
                }
                return `<a href="${link}" target="_blank" style="padding: 16px 24px; background: #9b51e0; color: white; text-decoration: none; border-radius: 20px; font-weight: bold; margin-bottom: 12px; display:block; text-align:center;">Ver Video Tutorial ${i+1}</a>`;
              }).join("");
            }
          }"""

tut_logic_new = """          const tuts = [data.tut1 || data.tutorials?.[0], data.tut2 || data.tutorials?.[1], data.tut3 || data.tutorials?.[2]];
          const tutList = document.getElementById("tutoriales-list");
          if (tutList) {
            tutList.innerHTML = tuts.map((link, i) => {
              if(!link) return '';
              if(link.includes("youtube.com") || link.includes("youtu.be")) {
                let embedUrl = link.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/");
                return `<iframe width="100%" height="250" style="border-radius:12px; margin-bottom: 24px;" src="${embedUrl}" frameborder="0" allowfullscreen></iframe>`;
              }
              // If it's a direct video link from Catbox/GoFile
              if(link.match(/\.(mp4|webm)$/i)) {
                 return `<video controls src="${link}" style="width:100%; border-radius:12px; margin-bottom: 24px;"></video>`;
              }
              return `<a href="${link}" target="_blank" style="padding: 16px 24px; background: #9b51e0; color: white; text-decoration: none; border-radius: 20px; font-weight: bold; margin-bottom: 12px; display:block; text-align:center;">Ver Video Tutorial ${i+1}</a>`;
            }).join("");
          }"""

html = html.replace(tut_logic_old, tut_logic_new)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
