import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Add the login modal HTML
login_html = """
  <!-- LOGIN MODAL PARA ADMIN -->
  <div id="login-modal" class="sub-panel" style="z-index: 999999; display:none; justify-content:center; align-items:center; background: rgba(0,0,0,0.9);">
    <div style="background: var(--bg-card); padding: 40px; border-radius: 20px; border: 1px solid var(--line-bright); width: 100%; max-width: 350px; text-align:center;">
      <h3 style="color: var(--fuchsia); font-weight:900; margin-bottom: 20px;">ACCESO ADMINISTRADOR</h3>
      <input type="text" id="login-user" placeholder="Usuario" class="admin-input" style="margin-bottom: 15px;" />
      <input type="password" id="login-pass" placeholder="Contraseña" class="admin-input" style="margin-bottom: 20px;" />
      <button id="btn-login-submit" style="background: var(--fuchsia); color: white; width: 100%; padding: 12px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">INGRESAR</button>
      <button id="btn-login-cancel" style="background: transparent; color: var(--muted); width: 100%; padding: 12px; border: none; font-size: 12px; cursor: pointer; margin-top: 10px;">Cancelar</button>
    </div>
  </div>
"""

html = html.replace('<!-- FIN DEL CONTENEDOR PRINCIPAL -->', '<!-- FIN DEL CONTENEDOR PRINCIPAL -->\n' + login_html)

# Update the JS logic
old_js = """    const authBtn = document.getElementById("btn-auth");
    const adminModal = document.getElementById("admin-modal");
    
    if (authBtn) {
      authBtn.addEventListener("click", () => {
        adminModal.classList.toggle("is-open");
      });
    }"""

new_js = """    const authBtn = document.getElementById("btn-auth");
    const adminModal = document.getElementById("admin-modal");
    const loginModal = document.getElementById("login-modal");
    const btnLoginSubmit = document.getElementById("btn-login-submit");
    const btnLoginCancel = document.getElementById("btn-login-cancel");
    
    let isAuthenticated = false;

    if (authBtn) {
      authBtn.addEventListener("click", () => {
        if (adminModal.classList.contains("is-open")) {
          adminModal.classList.remove("is-open");
        } else {
          if (isAuthenticated) {
            adminModal.classList.add("is-open");
          } else {
            loginModal.style.display = "flex";
          }
        }
      });
    }

    if (btnLoginSubmit) {
      btnLoginSubmit.addEventListener("click", () => {
        const user = document.getElementById("login-user").value;
        const pass = document.getElementById("login-pass").value;
        if (user === "SANTIstp" && pass === "Namekusein123") {
          isAuthenticated = true;
          loginModal.style.display = "none";
          adminModal.classList.add("is-open");
          document.getElementById("login-user").value = "";
          document.getElementById("login-pass").value = "";
        } else {
          alert("Usuario o contraseña incorrectos.");
        }
      });
    }

    if (btnLoginCancel) {
      btnLoginCancel.addEventListener("click", () => {
        loginModal.style.display = "none";
      });
    }"""

html = html.replace(old_js, new_js)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
