import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

print('File size:', len(content))

srcs = re.findall(r'<script[^>]*src=[\'"](.*?)[\'"]', content)
print('\nCDN script sources:')
for s in srcs:
    print(' ', s)

print('\nEnd of file (last 300 chars):')
print(repr(content[-300:]))

# Check if babel script tag exists
if 'text/babel' in content:
    print('\n[OK] Babel script tag found')
else:
    print('\n[MISSING] No text/babel script tag!')

# Check if root div exists
if 'id="root"' in content:
    print('[OK] Root div found')
else:
    print('[MISSING] Root div not found!')
