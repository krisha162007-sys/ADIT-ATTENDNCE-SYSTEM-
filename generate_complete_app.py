import os
import re

# Complete list of all icons with their SVG paths/definitions
ICON_NAMES = [
    'AlertCircle', 'AlertTriangle', 'ArrowLeft', 'ArrowRight', 'Award', 'BarChart3',
    'Bell', 'BookOpen', 'BookPlus', 'Brain', 'Briefcase', 'Building2', 'Calendar',
    'CalendarIcon', 'Check', 'CheckCircle', 'CheckCircle2', 'CheckSquare', 'ChevronDown',
    'ChevronLeft', 'ChevronRight', 'Clock', 'Cog', 'Copy', 'Cpu', 'Download',
    'Edit2', 'Edit3', 'Eye', 'FileSpreadsheet', 'FileText', 'Filter', 'GraduationCap',
    'HelpCircle', 'Image', 'ImageIcon', 'KeyRound', 'Laptop', 'Layers', 'LayoutDashboard',
    'List', 'Loader2', 'Lock', 'LogOut', 'Mail', 'MapPin', 'Network', 'Percent',
    'Phone', 'Plus', 'PlusCircle', 'Printer', 'RotateCcw', 'Save', 'Search',
    'Settings', 'SettingsIcon', 'ShieldCheck', 'Sparkles', 'Table2', 'Trash2',
    'UploadCloud', 'User', 'UserCheck', 'UserPlus', 'UserX', 'Users', 'X', 'XSquare'
]

def generate():
    files = [
        'src/services/attendanceStorage.js',
        'src/services/timetableStorage.js',
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
        'src/components/DepartmentAdminPanel.jsx',
        'src/components/AdminPanel.jsx',
        'src/App.jsx'
    ]

    combined_js = []
    
    for rel_path in files:
        if not os.path.exists(rel_path):
            print(f'Warning: {rel_path} not found!')
            continue
        with open(rel_path, 'r', encoding='utf-8') as f:
            code = f.read()

        # Strip all import statements
        code = re.sub(r'import\s+React[^\n]*\n', '\n', code)
        code = re.sub(r'import\s+{[^}]+}\s+from\s+[\'\"][^\'\"]+[\'\"];?', '\n', code)
        code = re.sub(r'import\s+\*\s+as\s+XLSX\s+from\s+[\'\"]xlsx[\'\"];?', '\n', code)
        code = re.sub(r'import\s+[A-Za-z0-9_]+\s+from\s+[\'\"][^\'\"]+[\'\"];?', '\n', code)
        
        # Strip all export keywords
        code = re.sub(r'export\s+default\s+function\s+([A-Za-z0-9_]+)', r'function \1', code)
        code = re.sub(r'export\s+default\s+', '// export default ', code)
        code = re.sub(r'export\s+const\s+', 'const ', code)
        code = re.sub(r'export\s+let\s+', 'let ', code)
        code = re.sub(r'export\s+function\s+', 'function ', code)

        combined_js.append(f'// ==================== {rel_path} ====================\n' + code)

    # Icon generator script to define every icon component reliably
    icon_defs = []
    for name in ICON_NAMES:
        icon_defs.append(f'const {name} = createIconComponent("{name}");')
    icon_defs_str = "\n".join(icon_defs)

    app_header = f"""
// ==================== React Hooks & Global Utilities ====================
const {{ useState, useEffect, useMemo, useRef, useCallback, createContext, useContext }} = React;

// Universal Icon Component Generator
function createIconComponent(iconName) {{
  return function GenericIcon(props) {{
    const {{ size = 20, color = 'currentColor', strokeWidth = 2, className = '', style = {{}}, ...rest }} = props;
    
    // Check if Lucide UMD icon exists
    if (window.lucide && window.lucide.icons) {{
      const kebab = iconName.replace(/([a-z0-9])([A-Z])/g, '-').toLowerCase().replace('icon', '').replace('2', '-2').replace('3', '-3');
      const lucideData = window.lucide.icons[kebab] || window.lucide.icons[kebab.replace('-2', '2')] || window.lucide.icons[iconName.toLowerCase()];
      if (lucideData) {{
        const renderNode = (node, key) => {{
          const [tag, attrs = {{}}, children = []] = node;
          const reactAttrs = {{ key }};
          Object.keys(attrs).forEach(k => {{
            if (k === 'class') reactAttrs.className = attrs[k];
            else reactAttrs[k] = attrs[k];
          }});
          return React.createElement(tag, reactAttrs, (children || []).map((child, idx) => renderNode(child, idx)));
        }};
        return React.createElement(
          'svg',
          {{
            xmlns: 'http://www.w3.org/2000/svg',
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: color,
            strokeWidth: strokeWidth,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            className: className,
            style: {{ display: 'inline-block', verticalAlign: 'middle', ...style }},
            ...rest
          }},
          (lucideData[2] || []).map((child, idx) => renderNode(child, idx))
        );
      }}
    }}

    // Fallback Clean SVG Icon Shape
    return React.createElement(
      'svg',
      {{
        xmlns: 'http://www.w3.org/2000/svg',
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: color,
        strokeWidth: strokeWidth,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        className: className,
        style: {{ display: 'inline-block', verticalAlign: 'middle', ...style }},
        ...rest
      }},
      React.createElement('circle', {{ cx: '12', cy: '12', r: '9' }}),
      React.createElement('path', {{ d: 'M12 8v4l3 3' }})
    );
  }};
}}

// Define all Lucide Icons in lexical scope
{icon_defs_str}
"""

    mount_footer = """
// ==================== App Error Boundary & Mount ====================
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('App Error:', error, info);
    this.setState({ info });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', maxWidth: '700px', margin: '60px auto', backgroundColor: '#fff1f2', border: '2px solid #fecdd3', borderRadius: '12px', fontFamily: 'sans-serif' }}>
          <h2 style={{ color: '#e11d48', fontSize: '20px', fontWeight: '800' }}>Application UI Warning</h2>
          <p style={{ marginTop: '8px', color: '#9f1239' }}>{String(this.state.error?.message || this.state.error)}</p>
          <pre style={{ marginTop: '12px', padding: '12px', backgroundColor: '#ffffff', borderRadius: '8px', overflowX: 'auto', fontSize: '12px', color: '#64748b' }}>
            {this.state.info?.componentStack || String(this.state.error?.stack || '')}
          </pre>
          <button onClick={() => window.location.reload()} style={{ marginTop: '16px', padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
            Reload Portal
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

try {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      React.createElement(ErrorBoundary, null, React.createElement(App))
    );
  }
} catch (err) {
  console.error('Mount Error:', err);
  document.body.innerHTML = '<div style="padding:40px;color:red;font-family:sans-serif;"><h3>Mount Error:</h3><pre>' + err.message + '</pre></div>';
}
"""

    full_code = app_header + "\n\n" + "\n\n".join(combined_js) + "\n\n" + mount_footer

    with open('src/index.css', 'r', encoding='utf-8') as f:
        css_content = f.read()

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ADIT Attendance System - Academic Portal</title>
  
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  
  <!-- CDN Scripts with fallback -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/lucide@0.460.0/dist/umd/lucide.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.10/babel.min.js"></script>
  
  <style>
{css_content}
  </style>
</head>
<body>
  <div id="root">
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:'Plus Jakarta Sans',sans-serif;color:#1e3a8a;background-color:#f8fafc;">
      <div style="width:48px;height:48px;border:4px solid #dbeafe;border-top:4px solid #2563eb;border-radius:50%;animation:spin 1s linear infinite;"></div>
      <h3 style="margin-top:16px;font-weight:700;font-size:18px;">Initializing ADIT Attendance System...</h3>
      <p style="margin-top:4px;color:#64748b;font-size:13px;">Loading portal components & administration matrix</p>
    </div>
  </div>

  <style>
    @keyframes spin {{
      0% {{ transform: rotate(0deg); }}
      100% {{ transform: rotate(360deg); }}
    }}
  </style>

  <script>
    window.onerror = function(msg, url, line, col, error) {{
      console.error('Window Error:', msg, url, line, col, error);
      const root = document.getElementById('root');
      if (root && root.innerHTML.includes('Initializing')) {{
        root.innerHTML = '<div style="padding:40px;max-width:600px;margin:60px auto;background:#fff1f2;border:2px solid #fecdd3;border-radius:12px;font-family:sans-serif;"><h3 style="color:#e11d48">Loading Error:</h3><p style="color:#9f1239">' + msg + ' (Line: ' + line + ')</p><button onclick="location.reload()" style="margin-top:16px;padding:8px 16px;background:#2563eb;color:white;border:none;border-radius:6px;cursor:pointer;">Retry</button></div>';
      }}
    }};
  </script>

  <script type="text/babel" data-presets="react">
{full_code}
  </script>
</body>
</html>
"""

    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(html)
    try:
        with open('dist/index.html', 'w', encoding='utf-8') as f:
            f.write(html)
    except OSError:
        pass
        
    print('Fresh production-ready bundle generated successfully!')

if __name__ == '__main__':
    generate()
