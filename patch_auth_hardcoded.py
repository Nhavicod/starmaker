import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Remove the bad #login-modal
bad_modal = r"<!-- LOGIN MODAL PARA ADMIN -->.*?</div>\s*</div>"
html = re.sub(bad_modal, "", html, flags=re.DOTALL)

# 2. Remove the bad JS
bad_js = r"const authBtn = document.getElementById\(\"btn-auth\"\);.*?loginModal\.style\.display = \"none\";\s*\n\s*\}\);\s*\n\s*\}"
html = re.sub(bad_js, "", html, flags=re.DOTALL)

# 3. Update the HTML inside admin-login-view
old_login_html = """        <form id="form-auth-login">
          <div class="admin-field">
            <label>Correo Electrónico:</label>
            <input type="email" class="admin-input" id="auth-email" value="sosbamban@gmail.com" required autocomplete="username" />
          </div>
          <div class="admin-field">
            <label>Contraseña:</label>
            <input type="password" class="admin-input" id="auth-password" value="Starmaker2026!" required autocomplete="current-password" />
          </div>
          <p id="auth-error-msg" style="color:var(--pink);font-size:12px;margin-bottom:12px;display:none;"></p>
          <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;">
            INICIAR SESIÓN →
          </button>
        </form>"""

new_login_html = """        <form id="form-auth-login">
          <div class="admin-field">
            <label>Usuario:</label>
            <input type="text" class="admin-input" id="auth-email" value="" placeholder="Usuario" required autocomplete="username" />
          </div>
          <div class="admin-field">
            <label>Contraseña:</label>
            <input type="password" class="admin-input" id="auth-password" value="" placeholder="Contraseña" required autocomplete="current-password" />
          </div>
          <p id="auth-error-msg" style="color:var(--pink);font-size:12px;margin-bottom:12px;display:none;"></p>
          <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center;">
            INICIAR SESIÓN →
          </button>
        </form>"""

html = html.replace(old_login_html, new_login_html)

# 4. Update the JS logic
old_openAdmin = """    function openAdmin() {
      modal.classList.add("is-open");
      if(loginView) loginView.style.display = "none";
      panelView.style.display = "block";
    }"""

new_openAdmin = """    let isHardcodedAuthenticated = false;
    function openAdmin() {
      modal.classList.add("is-open");
      if (!isHardcodedAuthenticated) {
        if(loginView) loginView.style.display = "block";
        panelView.style.display = "none";
      } else {
        if(loginView) loginView.style.display = "none";
        panelView.style.display = "block";
      }
    }"""

html = html.replace(old_openAdmin, new_openAdmin)

old_submit = """      try {
        await signInWithEmailAndPassword(auth, em, pw);
        loginView.style.display = "none";
        panelView.style.display = "block";
      } catch (err) {
        authError.textContent = "Error de acceso: " + err.message;
        authError.style.display = "block";
      }"""

new_submit = """      if (em === "SANTIstp" && pw === "Namekusein123") {
        isHardcodedAuthenticated = true;
        loginView.style.display = "none";
        panelView.style.display = "block";
        document.getElementById("auth-email").value = "";
        document.getElementById("auth-password").value = "";
      } else {
        authError.textContent = "Usuario o contraseña incorrectos.";
        authError.style.display = "block";
      }"""

html = html.replace(old_submit, new_submit)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
