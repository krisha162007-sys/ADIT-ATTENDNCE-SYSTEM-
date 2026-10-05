import urllib.request
import os

os.makedirs('vendor', exist_ok=True)

deps = [
    ('https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js', 'vendor/react.min.js'),
    ('https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js', 'vendor/react-dom.min.js'),
    ('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js', 'vendor/xlsx.min.js'),
    ('https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.10/babel.min.js', 'vendor/babel.min.js'),
    ('https://unpkg.com/lucide@0.460.0/dist/umd/lucide.min.js', 'vendor/lucide.min.js'),
]

for url, dest in deps:
    if os.path.exists(dest) and os.path.getsize(dest) > 10000:
        print(f'[SKIP] {dest} already exists ({os.path.getsize(dest)} bytes)')
        continue
    print(f'Downloading {url} ...')
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=60) as r:
            data = r.read()
        with open(dest, 'wb') as f:
            f.write(data)
        print(f'  -> {dest} ({len(data)} bytes)')
    except Exception as e:
        print(f'  ERROR: {e}')

print('\nAll done!')
