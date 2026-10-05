import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

babel_start = content.find('<script type="text/babel"')
babel_end = content.rfind('</script>')
babel_code = content[babel_start:babel_end]

# Check for ManageMaster
print('ManageMaster in build:', 'ManageMaster' in babel_code)
print('function ManageMaster in build:', 'function ManageMaster' in babel_code)

# Check App component end
app_start = babel_code.find('// ==================== src/App.jsx')
app_chunk = babel_code[app_start:app_start+500]
print('\nApp.jsx section:')
print(app_chunk)
