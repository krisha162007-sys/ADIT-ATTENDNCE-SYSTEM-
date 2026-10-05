import re

with open('index_original.html', 'r', encoding='utf-8') as f:
    content = f.read()

srcs = re.findall(r'src=["\']([^"\']+)["\']', content)
print('CDN sources in original:')
for s in srcs:
    print(' ', s)

print('\nSize:', len(content))
