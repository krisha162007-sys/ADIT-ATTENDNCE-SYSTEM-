import re

# Read current index.html
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the <script type="text/babel" ...> block with a manually-triggered transform
# Extract the JSX code from the babel script tag
babel_match = re.search(r'<script type="text/babel"[^>]*>(.*?)</script>', content, re.DOTALL)
if not babel_match:
    print("ERROR: Could not find text/babel script tag!")
    exit(1)

jsx_code = babel_match.group(1)
print(f"JSX code length: {len(jsx_code)} chars")

# Escape the JSX code for embedding in a JS string
# We'll store it in a <script type="text/jsx-source"> tag and use Babel API to compile
source_tag = f'<script type="text/jsx-source" id="jsx-source">\n{jsx_code}\n</script>'

manual_transform_script = '''
<script>
(function() {
  var show = function(msg, isError) {
    var d = document.getElementById('root');
    if (!d) return;
    d.innerHTML = '<div style="padding:24px;font-family:monospace;font-size:13px;background:' +
      (isError ? '#fff0f0' : '#f0fff4') + ';border:2px solid ' + (isError ? 'red' : 'green') +
      ';margin:16px;border-radius:8px;white-space:pre-wrap;">' + msg + '</div>';
  };

  // Wait for Babel to be ready
  function tryCompile() {
    if (typeof Babel === 'undefined') {
      show('Waiting for Babel...', false);
      setTimeout(tryCompile, 200);
      return;
    }
    show('Babel loaded. Compiling JSX...', false);

    var sourceEl = document.getElementById('jsx-source');
    if (!sourceEl) { show('ERROR: jsx-source element not found!', true); return; }
    var code = sourceEl.textContent;

    try {
      var transformed = Babel.transform(code, {
        presets: ['react'],
        filename: 'app.jsx'
      });
      show('Compilation OK! Executing...', false);
      try {
        // eslint-disable-next-line no-new-func
        new Function(transformed.code)();
      } catch(execErr) {
        show('EXECUTION ERROR:\\n' + execErr.name + ': ' + execErr.message + '\\n\\n' + (execErr.stack || ''), true);
      }
    } catch(babelErr) {
      show('BABEL COMPILE ERROR:\\n' + babelErr.message, true);
    }
  }

  window.addEventListener('load', tryCompile);
})();
</script>
'''

# Replace the text/babel script with the source tag + manual transform script
new_content = content.replace(babel_match.group(0), source_tag + '\n' + manual_transform_script)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Done! Manual Babel transform injected.")
