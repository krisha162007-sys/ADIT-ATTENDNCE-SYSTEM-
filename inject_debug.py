import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Inject error handler right before </body>
error_script = '''
  <script>
    window.onerror = function(msg, src, line, col, err) {
      document.getElementById('root').innerHTML =
        '<div style="padding:30px;font-family:monospace;background:#fff0f0;border:2px solid red;margin:20px;border-radius:8px;">' +
        '<h2 style="color:red">&#9888; JavaScript Error</h2>' +
        '<p><b>Message:</b> ' + msg + '</p>' +
        '<p><b>Source:</b> ' + src + '</p>' +
        '<p><b>Line:</b> ' + line + ' Col: ' + col + '</p>' +
        '<pre style="white-space:pre-wrap;color:#333">' + (err ? err.stack : '') + '</pre>' +
        '</div>';
      return false;
    };
    window.addEventListener('unhandledrejection', function(e) {
      document.getElementById('root').innerHTML =
        '<div style="padding:30px;font-family:monospace;background:#fff0f0;border:2px solid red;margin:20px;border-radius:8px;">' +
        '<h2 style="color:red">&#9888; Unhandled Promise Rejection</h2>' +
        '<pre style="white-space:pre-wrap;color:#333">' + e.reason + '</pre>' +
        '</div>';
    });
  </script>
'''

# Also add a loading indicator in root div
content = content.replace(
    '<div id="root"></div>',
    '<div id="root"><div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#555;font-size:18px;">&#9696; Loading ADIT Attendance System...</div></div>'
)

content = content.replace('</body>', error_script + '\n</body>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Error handler injected into index.html')
