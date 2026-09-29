import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Add a global error handler to show errors on screen
error_script = """
<script>
window.onerror = function(msg, url, lineNo, columnNo, error) {
  var errDiv = document.getElementById('debug-error');
  if (!errDiv) {
    errDiv = document.createElement('div');
    errDiv.id = 'debug-error';
    errDiv.style.position = 'fixed';
    errDiv.style.top = '0';
    errDiv.style.left = '0';
    errDiv.style.width = '100%';
    errDiv.style.background = 'red';
    errDiv.style.color = 'white';
    errDiv.style.zIndex = '99999999';
    errDiv.style.padding = '10px';
    errDiv.style.fontFamily = 'monospace';
    document.body.appendChild(errDiv);
  }
  errDiv.innerHTML += '<p>' + msg + ' at ' + lineNo + ':' + columnNo + '</p>';
  return false;
};
</script>
"""

html = html.replace('</head>', error_script + '\n</head>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
