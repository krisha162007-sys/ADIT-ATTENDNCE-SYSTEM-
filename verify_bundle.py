import build_bundle
build_bundle.build()

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
match = re.search(r'<script type="text/babel"[^>]*>([\s\S]*?)</script>', text)
if match:
    script = match.group(1)
    lines = script.split('\n')
    top_vars = []
    in_block = 0
    for line in lines:
        stripped = line.strip()
        in_block += stripped.count('{') - stripped.count('}')
        if in_block == 0 or (in_block == 1 and line.startswith('const ') or line.startswith('let ') or line.startswith('var ')):
            m = re.match(r'^(?:const|let|var)\s+([A-Za-z0-9_]+)\s*=', line)
            if m:
                top_vars.append(m.group(1))

    from collections import Counter
    counts = Counter(top_vars)
    dups = {k: v for k, v in counts.items() if v > 1}
    print('Duplicate top-level variables:', dups)
    if not dups:
        print('SUCCESS: No duplicate top-level variables found!')
else:
    print('Could not find script block!')
