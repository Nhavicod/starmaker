import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the entire script block that contains Firebase and logic
# It starts at <script type="module"> and goes until the end of that tag.
script_pattern = r'<script type="module">.*?</script>'
content = re.sub(script_pattern, '<!-- Aquí iba la lógica de Javascript (Firebase, Interacciones) -->\n  <script>\n    // JS eliminado para dejar solo el cascarón estático.\n  </script>', content, flags=re.DOTALL)

# Optionally remove the other script tag if there is one
other_script = r'<script>\s*</script>'
content = re.sub(other_script, '', content, flags=re.DOTALL)

with open('cascaron_starmaker.html', 'w', encoding='utf-8') as f:
    f.write(content)

