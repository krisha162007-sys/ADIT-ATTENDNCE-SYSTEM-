"""
Build script using esbuild.exe to pre-compile JSX → plain JS.
No browser Babel needed — serves static JS directly.
"""
import re
import os
import sys
import subprocess

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

ESBUILD = os.path.abspath('esbuild.exe')

def strip_imports_exports(code):
    """Strip ES module syntax so files can be concatenated."""
    code = re.sub(r'^import\s+React[^\n]*\n', '\n', code, flags=re.MULTILINE)
    code = re.sub(r'^import\s+type\s+[^\n]*\n', '\n', code, flags=re.MULTILINE)
    code = re.sub(r'^import\s+\{[^}]+\}\s+from\s+[\'"][^\'"]+[\'"];?\n', '\n', code, flags=re.MULTILINE)
    code = re.sub(r'^import\s+\*\s+as\s+\w+\s+from\s+[\'"][^\'"]+[\'"];?\n', '\n', code, flags=re.MULTILINE)
    code = re.sub(r'^import\s+\w+\s+from\s+[\'"][^\'"]+[\'"];?\n', '\n', code, flags=re.MULTILINE)
    code = re.sub(r'\bexport\s+default\s+function\s+', 'function ', code)
    code = re.sub(r'\bexport\s+default\s+', '// export default ', code)
    code = re.sub(r'\bexport\s+const\s+', 'const ', code)
    code = re.sub(r'\bexport\s+var\s+', 'var ', code)
    code = re.sub(r'\bexport\s+let\s+', 'let ', code)
    code = re.sub(r'\bexport\s+function\s+', 'function ', code)
    return code

def build():
    all_files = [
        'src/services/attendanceStorage.js',
        'src/services/timetableStorage.js',
        'src/services/cloudSync.js',
        'src/components/Header.jsx',
        'src/components/Sidebar.jsx',
        'src/components/Dashboard.jsx',
        'src/components/EnterAttendance.jsx',
        'src/components/AttendanceSheetView.jsx',
        'src/components/AttendanceList.jsx',
        'src/components/DateView.jsx',
        'src/components/TopicView.jsx',
        'src/components/AnalyticsView.jsx',
        'src/components/PrintView.jsx',
        'src/components/ManageMaster.jsx',
        'src/components/FacultyEditModal.jsx',
        'src/components/SlotEditModal.jsx',
        'src/components/TimetableUploadModal.jsx',
        'src/components/FacultyTimetablePanel.jsx',
        'src/components/ClassTimetablePanel.jsx',
        'src/components/ClassManagementPanel.jsx',
        'src/components/DepartmentAdminPanel.jsx',
        'src/components/AdminPanel.jsx',
        'src/components/FacultyPanel.jsx',
        'src/components/StudentPanel.jsx',
        'src/components/LoginView.jsx',
        'src/App.jsx',
    ]

    # 1. Concatenate all source files into one JSX bundle
    parts = []
    for rel_path in all_files:
        if not os.path.exists(rel_path):
            print(f'WARNING: {rel_path} not found, skipping')
            continue
        with open(rel_path, 'r', encoding='utf-8') as f:
            code = f.read()
        code = strip_imports_exports(code)
        parts.append(f'// ==================== {rel_path} ====================\n' + code)

    parts.append('''
// ==================== Mount Root ====================
const rootElement = document.getElementById('root');
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(React.createElement(App));
}
''')

    raw_jsx = '\n\n'.join(parts)

    # Write as .jsx so esbuild knows to transform JSX
    raw_path = 'app-bundle-raw.jsx'
    with open(raw_path, 'w', encoding='utf-8') as f:
        f.write(raw_jsx)
    print(f'Raw bundle: {len(raw_jsx):,} chars')

    # 2. Use esbuild to transform JSX → plain JS via stdin
    out_js = 'app-bundle.js'
    cmd = [
        ESBUILD,
        '--loader=jsx',
        '--jsx-factory=React.createElement',
        '--jsx-fragment=React.Fragment',
        '--log-level=warning',
    ]
    result = subprocess.run(cmd, input=raw_jsx.encode('utf-8'), capture_output=True)

    if result.returncode != 0:
        print('esbuild FAILED:')
        try:
            print(result.stdout.decode('ascii', errors='replace'))
            print(result.stderr.decode('ascii', errors='replace'))
        except Exception:
            pass
        return False

    if result.stderr:
        try:
            print('esbuild warnings:', result.stderr.decode('ascii', errors='replace')[:500])
        except Exception:
            pass

    # stdout contains the compiled JS — write it to file
    with open(out_js, 'wb') as f:
        f.write(result.stdout)

    js_size = os.path.getsize(out_js)
    print(f'Compiled JS: {js_size:,} bytes -> {out_js}')

    # 3. Read CSS and build index.html (NO Babel, loads plain app-bundle.js)
    with open('src/index.css', 'r', encoding='utf-8') as f:
        css_content = f.read()

    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ADIT Attendance System - Academic Portal &amp; Administration</title>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">

  <!-- Local vendor libs (no CDN dependency) -->
  <script src="/libs/react.min.js"></script>
  <script src="/libs/react-dom.min.js"></script>
  <script src="/libs/lucide.min.js"></script>
  <script src="/libs/xlsx.min.js"></script>
  <script src="/libs/pdf.min.js"></script>
  <script src="/libs/tesseract.min.js"></script>

  <script>
    if (window.pdfjsLib) {{
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = '/libs/pdf.worker.min.js';
    }}
  </script>

  <style>
{css_content}
  </style>
</head>
<body>
  <div id="root"></div>

  <script>
    // Save native globals BEFORE Lucide setup (icons like "map","image","set" overwrite them)
    var _nat = {{}};
    ['Map','Set','WeakMap','WeakSet','Promise','Symbol','Error','Image','URL',
     'Event','Request','Response','Headers','Date','RegExp','Number','String',
     'Boolean','Function','Array','Object','History','Location','Screen',
     'MutationObserver','IntersectionObserver','ResizeObserver'
    ].forEach(function(n) {{ if (window[n]) _nat[n] = window[n]; }});

    window.LucideIcons = {{}};
    if (window.lucide && window.lucide.icons) {{
      Object.keys(window.lucide.icons).forEach(iconName => {{
        const pascalName = iconName.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
        const IconComponent = (props) => {{
          const {{ size = 24, color = 'currentColor', strokeWidth = 2, className = '', style = {{}}, ...rest }} = props;
          const svgContent = window.lucide.icons[iconName];
          if (!svgContent) return null;
          const renderNode = (node, key) => {{
            const [tag, attrs = {{}}, children = []] = node;
            const reactAttrs = {{ key }};
            Object.keys(attrs).forEach(k => {{ reactAttrs[k === 'class' ? 'className' : k] = attrs[k]; }});
            return React.createElement(tag, reactAttrs, (children || []).map((c, i) => renderNode(c, i)));
          }};
          return React.createElement('svg', {{
            xmlns: 'http://www.w3.org/2000/svg', width: size, height: size,
            viewBox: '0 0 24 24', fill: 'none', stroke: color,
            strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round',
            className, style: {{ display: 'inline-block', verticalAlign: 'middle', ...style }}, ...rest
          }}, (svgContent[2] || []).map((c, i) => renderNode(c, i)));
        }};
        window[pascalName] = IconComponent;
        window.LucideIcons[pascalName] = IconComponent;
      }});
    }}

    // Restore native globals Lucide may have overwritten
    Object.keys(_nat).forEach(function(n) {{ window[n] = _nat[n]; }});

    // Icon aliases (use LucideIcons to avoid conflict with natives)
    window.CalendarIcon = window.LucideIcons.Calendar;
    window.SettingsIcon = window.LucideIcons.Settings;
    window.ImageIcon    = window.LucideIcons.Image;
    window.MapIcon      = window.LucideIcons.Map;

    // Expose React hooks as TRUE globals on window so app-bundle.js can access them
    window.useState      = React.useState;
    window.useEffect     = React.useEffect;
    window.useMemo       = React.useMemo;
    window.useRef        = React.useRef;
    window.useCallback   = React.useCallback;
    window.createContext = React.createContext;
    window.useContext    = React.useContext;
    window.useReducer    = React.useReducer;
    window.useLayoutEffect = React.useLayoutEffect;
  </script>

  <!-- Error handler: shows React errors on screen instead of blank page -->
  <script>
    window.onerror = function(msg, src, line, col, err) {{
      document.getElementById('root').innerHTML =
        '<div style="padding:20px;font-family:monospace;font-size:13px;background:#fff0f0;border:2px solid red;margin:12px;border-radius:8px;white-space:pre-wrap;max-height:80vh;overflow:auto">' +
        '<b style="color:red;font-size:15px">App Error</b><br><br>' +
        '<b>Message:</b> ' + msg + '<br>' +
        '<b>File:</b> ' + src + ' Line ' + line + '<br><br>' +
        '<b>Stack:</b><br>' + (err ? err.stack : 'n/a') + '</div>';
    }};
    window.addEventListener('unhandledrejection', function(e) {{
      document.getElementById('root').innerHTML =
        '<div style="padding:20px;font-family:monospace;font-size:13px;background:#fff0f0;border:2px solid red;margin:12px;border-radius:8px;white-space:pre-wrap">' +
        '<b style="color:red">Unhandled Promise Rejection</b><br><br>' + e.reason + '</div>';
    }});
  </script>

  <!-- Pre-compiled app (no Babel needed!) -->
  <script src="/app-bundle.js"></script>
</body>
</html>
'''

    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(html)
    try:
        os.makedirs('dist', exist_ok=True)
        with open('dist/index.html', 'w', encoding='utf-8') as f:
            f.write(html)
        import shutil
        shutil.copy(out_js, 'dist/app-bundle.js')
        if os.path.exists('libs'):
            shutil.copytree('libs', 'dist/libs', dirs_exist_ok=True)
        if os.path.exists('public'):
            for item in os.listdir('public'):
                s = os.path.join('public', item)
                d = os.path.join('dist', item)
                if os.path.isdir(s):
                    shutil.copytree(s, d, dirs_exist_ok=True)
                else:
                    shutil.copy2(s, d)
    except OSError:
        pass

    print('Build completed successfully! (No Babel required)')
    return True

if __name__ == '__main__':
    build()
