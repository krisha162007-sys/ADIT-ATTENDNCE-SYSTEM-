import urllib.request
import os

libs = [
    ("https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js", "libs/react.min.js"),
    ("https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js", "libs/react-dom.min.js"),
    ("https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.10/babel.min.js", "libs/babel.min.js"),
    ("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js", "libs/xlsx.min.js"),
    ("https://unpkg.com/lucide@0.460.0/dist/umd/lucide.min.js", "libs/lucide.min.js"),
]

os.makedirs("libs", exist_ok=True)

for url, path in libs:
    if os.path.exists(path):
        print(f"Already exists: {path}")
        continue
    print(f"Downloading {url} -> {path} ...")
    try:
        urllib.request.urlretrieve(url, path)
        size = os.path.getsize(path)
        print(f"  OK ({size:,} bytes)")
    except Exception as e:
        print(f"  FAILED: {e}")

print("\nDone!")
