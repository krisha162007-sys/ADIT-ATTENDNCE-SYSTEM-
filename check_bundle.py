import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

babel_marker = 'text/babel'
babel_start = content.find(babel_marker)
babel_code = content[babel_start:]

print('ManageMaster in build:', 'ManageMaster' in babel_code)
print('function ManageMaster:', 'function ManageMaster' in babel_code)

# List all top-level function definitions
funcs = re.findall(r'^function (\w+)', babel_code, re.MULTILINE)
print('\nTop-level functions in bundle:')
for f in funcs:
    print(' -', f)
