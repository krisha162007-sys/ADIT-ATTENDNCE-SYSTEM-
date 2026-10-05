import os, re

components_dir = 'src'
icons = set()
for root, dirs, files in os.walk(components_dir):
    for f in files:
        if f.endswith('.jsx') or f.endswith('.js'):
            with open(os.path.join(root, f), 'r', encoding='utf-8') as file:
                content = file.read()
                matches = re.findall(r'import\s+\{([^}]+)\}\s+from\s+[\'\"]lucide-react[\'\"]', content)
                for m in matches:
                    for icon in m.split(','):
                        clean = icon.strip().split(' as ')[0].strip()
                        if clean:
                            icons.add(clean)

print('All lucide icons in project:')
for i in sorted(list(icons)):
    print(f'  {i}')
