import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Add keydown event listener to login-pass
enter_logic = """
    const passInput = document.getElementById("login-pass");
    if (passInput) {
      passInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") btnLoginSubmit.click();
      });
    }
"""

html = html.replace('if (btnLoginCancel)', enter_logic + '\n    if (btnLoginCancel)')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
