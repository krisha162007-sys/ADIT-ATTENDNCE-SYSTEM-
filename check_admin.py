import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the babel script block
babel_start = content.find('<script type="text/babel"')
babel_end = content.rfind('</script>')
babel_code = content[babel_start:babel_end]

# Search for the AdminPanel section
admin_start = babel_code.find('// ==================== src/components/AdminPanel.jsx')
admin_chunk = babel_code[admin_start:admin_start+3000]
print(admin_chunk)
