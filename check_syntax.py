"""Check source files for common JSX/JS syntax issues"""
import re, os

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

for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        code = fp.read()
    issues = []
    # Check for template literals with backtick issues
    backticks = code.count('`')
    if backticks % 2 != 0:
        issues.append(f'ODD number of backticks: {backticks}')
    # Check braces balance (rough)
    opens = code.count('{')
    closes = code.count('}')
    if abs(opens - closes) > 5:
        issues.append(f'Brace mismatch: {{ opens={opens}, closes={closes}')
    if issues:
        print(f'ISSUES in {f}:')
        for i in issues:
            print(f'  - {i}')
    else:
        print(f'OK: {f}')
