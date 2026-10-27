import os
import sys
import time
import subprocess
import json
from http.server import SimpleHTTPRequestHandler, HTTPServer
import threading

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

PORT = 8845
HTML_TEST_FILE = "test_lab_tag_upload_suite.html"

HTML_CONTENT = """<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Lab Tag Upload & Consecutive Slots Suite</title>
  <link rel="stylesheet" href="/src/index.css">
  <script src="/libs/react.min.js"></script>
  <script src="/libs/react-dom.min.js"></script>
  <script src="/libs/lucide.min.js"></script>
  <script src="/libs/xlsx.min.js"></script>
  <script src="/libs/pdf.min.js"></script>
  <script>
    var _nat = {};
    ['Map','Set','WeakMap','WeakSet','Promise','Symbol','Error','Image','URL',
     'Event','Request','Response','Headers','Date','RegExp','Number','String',
     'Boolean','Function','Array','Object','History','Screen',
     'MutationObserver','IntersectionObserver','ResizeObserver'
    ].forEach(function(n) { if (window[n]) _nat[n] = window[n]; });

    window.LucideIcons = {};
    if (window.lucide && window.lucide.icons) {
      Object.keys(window.lucide.icons).forEach(iconName => {
        const pascalName = iconName.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
        const IconComponent = (props) => {
          const { size = 24, color = 'currentColor', strokeWidth = 2, className = '', style = {}, ...rest } = props;
          const svgContent = window.lucide.icons[iconName];
          if (!svgContent) return null;
          const renderNode = (node, key) => {
            const [tag, attrs = {}, children = []] = node;
            const reactAttrs = { key };
            Object.keys(attrs).forEach(k => { reactAttrs[k === 'class' ? 'className' : k] = attrs[k]; });
            return React.createElement(tag, reactAttrs, (children || []).map((c, i) => renderNode(c, i)));
          };
          return React.createElement('svg', {
            xmlns: 'http://www.w3.org/2000/svg', width: size, height: size,
            viewBox: '0 0 24 24', fill: 'none', stroke: color,
            strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round',
            className, style: { display: 'inline-block', verticalAlign: 'middle', ...style }, ...rest
          }, (svgContent[2] || []).map((c, i) => renderNode(c, i)));
        };
        window[pascalName] = IconComponent;
        window.LucideIcons[pascalName] = IconComponent;
      });
    }

    Object.keys(_nat).forEach(function(n) { try { window[n] = _nat[n]; } catch(e){} });

    window.CalendarIcon = (window.LucideIcons && window.LucideIcons.Calendar) || null;
    window.SettingsIcon = (window.LucideIcons && window.LucideIcons.Settings) || null;
    window.ImageIcon    = (window.LucideIcons && window.LucideIcons.Image) || null;

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
  <script>
    window.onerror = function(msg, url, line, col, error) {
      fetch('/api/test-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{ name: 'Script Load Error: ' + msg + ' (line ' + line + ')', pass: false, extra: String(error) }])
      });
    };
  </script>
  <script src="/app-bundle.js?v=lab_tag_fix_2"></script>
</head>
<body>
  <div id="test-root" style="padding: 20px;"></div>
  <script>
    async function runTests() {
      const results = [];
      function assert(name, condition, extra = '') {
        results.push({ name, pass: !!condition, extra: String(extra) });
      }

      try {
        localStorage.clear();

        const faculty = { id: 'FAC_TEST_LAB', name: 'Prof. Lab Test', dept: 'Information Technology', departmentId: 'DEP_IT' };
        localStorage.setItem('adit_attendance_faculties', JSON.stringify([faculty]));

        // 1. Verify canMergeConsecutiveSlots merges two consecutive slots of the same class even WITHOUT pre-existing lab tag
        const slotA = {
          subject: 'DBMS',
          name: 'Database Management Systems',
          sem: '5th Sem',
          div: 'Div 1',
          batch: 'ALL',
          departmentId: 'DEP_IT',
          facultyId: 'FAC_TEST_LAB',
          facultyName: 'Prof. Lab Test',
          room: 'Room 201',
          timeSlot: '10:55 - 11:45',
          type: 'Lecture' // Initially just standard lecture
        };
        const slotB = {
          subject: 'DBMS',
          name: 'Database Management Systems',
          sem: '5th Sem',
          div: 'Div 1',
          batch: 'ALL',
          departmentId: 'DEP_IT',
          facultyId: 'FAC_TEST_LAB',
          facultyName: 'Prof. Lab Test',
          room: 'Room 201',
          timeSlot: '11:50 - 12:40',
          type: 'Lecture' // Same class extending to two consecutive slots
        };

        const canMergeSameClass = window.canMergeConsecutiveSlots(slotA, slotB);
        assert('canMergeConsecutiveSlots returns true for same class extending across 2 consecutive slots', canMergeSameClass);

        // Verify different subjects do NOT merge
        const slotDiffSubj = { ...slotB, subject: 'OS' };
        assert('canMergeConsecutiveSlots rejects different subjects', !window.canMergeConsecutiveSlots(slotA, slotDiffSubj));

        // Verify different batches (Batch A vs Batch B) do NOT merge
        const slotBatchA = { ...slotA, batch: 'Batch A' };
        const slotBatchB = { ...slotB, batch: 'Batch B' };
        assert('canMergeConsecutiveSlots rejects different batches', !window.canMergeConsecutiveSlots(slotBatchA, slotBatchB));

        // 2. Test normalizeTimetable upload normalization
        const rawGrid = {
          Monday: {
            // Consecutive periods of same class (10:55 to 12:40) -> Must become a 2-hour Lab!
            '10:55 - 11:45': {
              subject: 'Python',
              name: 'Python Programming',
              sem: '3rd Sem',
              div: 'Div 1',
              batch: 'Batch A',
              room: 'IT-5',
              departmentId: 'DEP_IT'
            },
            '11:50 - 12:40': {
              subject: 'Python',
              name: 'Python Programming',
              sem: '3rd Sem',
              div: 'Div 1',
              batch: 'Batch A',
              room: 'IT-5',
              departmentId: 'DEP_IT'
            },
            // Single 1-hour slot in room IT-5 with Batch B -> Must NOT be a Lab! Must be a Lecture!
            '9:00 - 9:55': {
              subject: 'Maths',
              name: 'Mathematics',
              sem: '3rd Sem',
              div: 'Div 1',
              batch: 'Batch B',
              room: 'IT-5',
              departmentId: 'DEP_IT'
            }
          }
        };

        const normalized = window.normalizeTimetable(rawGrid, '3rd Sem', 'Div 1', 'DEP_IT', 'Prof. Lab Test');
        const monGrid = normalized.timetable.Monday;

        // Verify the 2-slot consecutive class became a 2-hour Lab
        assert('2 consecutive slots merged into 2-hour lab at 10:55', monGrid['10:55 - 11:45'] && monGrid['10:55 - 11:45'].type === 'Lab');
        assert('Slot 1 has span: 2', monGrid['10:55 - 11:45'].span === 2);
        assert('Slot 1 has duration: 2 Hours', monGrid['10:55 - 11:45'].duration === '2 Hours');
        assert('Slot 2 is marked continuation', monGrid['11:50 - 12:40'].isContinuation === true);
        assert('Both slots share same sessionId', monGrid['10:55 - 11:45'].sessionId === monGrid['11:50 - 12:40'].sessionId);

        // Verify single 1-hour slot is strictly a Lecture and NOT a Lab
        assert('Single 1-hour slot has type: Lecture (not Lab)', monGrid['9:00 - 9:55'].type === 'Lecture');
        assert('Single 1-hour slot has span: 1', monGrid['9:00 - 9:55'].span === 1);
        assert('Single 1-hour slot is not multiSlot', !monGrid['9:00 - 9:55'].isMultiSlot);

        // Verify previewLectures:
        // Python has 1 combined entry of 2 Hours
        const pythonPreview = normalized.previewLectures.find(l => l.subject === 'Python');
        assert('Preview has single combined 2-hour entry for Python', Boolean(pythonPreview));
        assert('Python preview type is Lab', pythonPreview?.type === 'Lab');
        assert('Python preview duration is 2 Hours', pythonPreview?.duration === '2 Hours');

        // Maths preview is 1 entry of 1 Hour with type Lecture
        const mathsPreview = normalized.previewLectures.find(l => l.subject === 'Maths');
        assert('Maths preview type is Lecture (not Lab)', mathsPreview?.type === 'Lecture');
        assert('Maths preview span is 1', mathsPreview?.span === 1);

        // 3. Test reconcileConsecutiveLabEntries
        const entries = [
          {
            id: 'E1',
            facultyId: 'FAC_TEST_LAB',
            day: 'Tuesday',
            timeSlot: '1:25 - 2:15',
            subject: 'Web Dev',
            subjectName: 'Web Development',
            sem: '5th Sem',
            div: 'Div 1',
            room: 'Lab 2',
            batch: 'Batch C',
            type: 'Lecture' // Initially Lecture
          },
          {
            id: 'E2',
            facultyId: 'FAC_TEST_LAB',
            day: 'Tuesday',
            timeSlot: '2:20 - 3:10',
            subject: 'Web Dev',
            subjectName: 'Web Development',
            sem: '5th Sem',
            div: 'Div 1',
            room: 'Lab 2',
            batch: 'Batch C',
            type: 'Lecture' // Consecutive matching
          },
          {
            id: 'E3',
            facultyId: 'FAC_TEST_LAB',
            day: 'Tuesday',
            timeSlot: '3:15 - 4:05',
            subject: 'Seminar',
            subjectName: 'Technical Seminar',
            sem: '5th Sem',
            div: 'Div 1',
            room: 'Lab 2',
            batch: 'ALL',
            type: 'Lab' // Accidental stale Lab tag on 1-hour session
          }
        ];

        window.reconcileConsecutiveLabEntries(entries);
        const e1 = entries.find(e => e.id === 'E1');
        const e2 = entries.find(e => e.id === 'E2');
        const e3 = entries.find(e => e.id === 'E3');

        assert('E1 reconciled to type: Lab', e1.type === 'Lab');
        assert('E1 has span: 2', e1.span === 2);
        assert('E2 reconciled to type: Lab continuation', e2.type === 'Lab' && e2.isContinuation === true);
        assert('E3 single 1-hour slot corrected to type: Lecture', e3.type === 'Lecture');
        assert('E3 has span: 1', e3.span === 1);

        // 4. Test DOM Rendering in FacultyTimetablePanel
        // Apply timetable to storage
        localStorage.setItem('adit_timetable_entries', JSON.stringify(entries));
        const root = document.getElementById('test-root');

        const element = React.createElement(window.FacultyTimetablePanel, {
          currentFaculty: faculty,
          faculties: [faculty],
          semesters: [{ id: '5th Sem', name: '5th Sem' }],
          divisions: [{ id: 'Div 1', name: 'Div 1' }],
          departments: [{ id: 'DEP_IT', name: 'Information Technology', code: 'IT' }],
          showToast: () => {}
        });

        ReactDOM.render(element, root);
        await new Promise(r => setTimeout(r, 600));

        // Inspect rendered DOM table
        const tables = root.querySelectorAll('table');
        assert('Faculty Timetable rendered table in DOM', tables.length > 0);

        // Find cell for Web Dev (2-hour Lab)
        const allTds = Array.from(root.querySelectorAll('td'));
        const webDevTd = allTds.find(td => td.textContent.includes('Web Dev'));
        assert('Web Dev cell found in DOM', Boolean(webDevTd));
        assert('Web Dev cell has rowSpan = 2', webDevTd && (webDevTd.rowSpan === 2 || webDevTd.getAttribute('rowspan') === '2'));
        assert('Web Dev cell displays "LAB (2h)" badge', webDevTd && webDevTd.textContent.includes('LAB (2h)'));

        // Find cell for Seminar (single 1-hour session)
        const seminarTd = allTds.find(td => td.textContent.includes('Seminar'));
        assert('Seminar cell found in DOM', Boolean(seminarTd));
        assert('Seminar cell has rowSpan = 1 (not merged)', !seminarTd?.rowSpan || seminarTd?.rowSpan === 1);
        assert('Seminar cell does NOT display "LAB" badge', seminarTd && !seminarTd.textContent.includes('LAB (2h)') && !seminarTd.textContent.includes('LAB'));

        // 5. Test real Excel sheet parsing via parseExcelTimetableForFaculty
        // Generate an in-memory workbook with timetable grid
        const ws_data = [
          ['Time', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          ['9:00 - 9:55', '', '', '', '3IT1 / COA / IT-5 / Batch A', '', ''],
          ['10:00 - 10:50', '', '', '', '', '', ''],
          ['10:55 - 11:45', '', '3IT1 / DLD / Room 101', '', '', '', ''],
          ['11:50 - 12:40', '', '3IT1 / DLD / Room 101', '', '', '', ''],
          ['12:40 - 1:25', 'LUNCH', 'LUNCH', 'LUNCH', 'LUNCH', 'LUNCH', 'LUNCH'],
          ['1:25 - 2:15', '', '', '', '', '', ''],
          ['2:20 - 3:10', '', '', '', '', '', '']
        ];
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(ws_data);
        XLSX.utils.book_append_sheet(wb, ws, 'Timetable');
        const excelArray = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const excelFile = new Uint8Array(excelArray);
        excelFile.name = 'test_lab_excel.xlsx';

        const excelParsed = await window.parseExcelTimetableForFaculty(excelFile, 'FAC_TEST_LAB', '3rd Sem', 'Div 1', 'DEP_IT');
        
        // Tuesday DLD occupies 2 consecutive periods: 10:55 - 11:45 and 11:50 - 12:40
        const dldSlot1 = excelParsed.timetable.Tuesday['10:55 - 11:45'];
        const dldSlot2 = excelParsed.timetable.Tuesday['11:50 - 12:40'];
        assert('Excel upload: Tuesday DLD slot 1 is recognized as Lab', dldSlot1 && dldSlot1.type === 'Lab');
        assert('Excel upload: Tuesday DLD slot 1 has span: 2', dldSlot1 && dldSlot1.span === 2);
        assert('Excel upload: Tuesday DLD slot 2 is continuation', dldSlot2 && dldSlot2.isContinuation === true);
        assert('Excel upload: Tuesday DLD both slots share sessionId', dldSlot1 && dldSlot2 && dldSlot1.sessionId === dldSlot2.sessionId);

        const dldPreview = excelParsed.previewLectures.find(p => p.day === 'Tuesday' && p.subject === 'DLD');
        assert('Excel upload: Tuesday DLD has single combined preview', Boolean(dldPreview));
        assert('Excel upload: Tuesday DLD preview type is Lab', dldPreview?.type === 'Lab');
        assert('Excel upload: Tuesday DLD preview time is combined 10:55 - 12:40', dldPreview?.time === '10:55 - 12:40');

        // Thursday COA occupies only 1 slot: 9:00 - 9:55
        const coaSlot = excelParsed.timetable.Thursday['9:00 - 9:55'];
        assert('Excel upload: Thursday COA (1-hour slot in IT-5 with Batch A) is Lecture (not Lab)', coaSlot && coaSlot.type === 'Lecture');
        assert('Excel upload: Thursday COA has span: 1', coaSlot && coaSlot.span === 1);
        assert('Excel upload: Thursday COA is not multiSlot', coaSlot && !coaSlot.isMultiSlot);

        const coaPreview = excelParsed.previewLectures.find(p => p.day === 'Thursday' && p.subject === 'COA');
        assert('Excel upload: Thursday COA preview type is Lecture', coaPreview?.type === 'Lecture');
        assert('Excel upload: Thursday COA preview span is 1', coaPreview?.span === 1);

      } catch (err) {
        assert('Execution failed with error: ' + err.message, false, err.stack);
      }

      fetch('/api/test-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(results)
      });
    }

    window.addEventListener('load', runTests);
  </script>
</body>
</html>
"""

test_results = None

class TestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def do_POST(self):
        global test_results
        if self.path == '/api/test-results':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            test_results = json.loads(post_data.decode('utf-8'))
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status":"ok"}')
        else:
            self.send_response(404)
            self.end_headers()

def run_tests():
    global test_results
    with open(HTML_TEST_FILE, "w", encoding="utf-8") as f:
        f.write(HTML_CONTENT)

    server = HTTPServer(('127.0.0.1', PORT), TestHandler)
    server_thread = threading.Thread(target=server.serve_forever)
    server_thread.daemon = True
    server_thread.start()

    print(f"Starting Lab Tag Upload Test Runner on port {PORT}...")
    edge_paths = [
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    ]
    edge_exe = next((p for p in edge_paths if os.path.exists(p)), None)
    if not edge_exe:
        print("Edge executable not found.")
        sys.exit(1)

    print("Launching Edge headless...")
    edge_process = subprocess.Popen([
        edge_exe,
        "--headless",
        "--disable-gpu",
        f"http://127.0.0.1:{PORT}/{HTML_TEST_FILE}"
    ])

    start = time.time()
    while test_results is None and (time.time() - start) < 25:
        time.sleep(0.5)

    edge_process.terminate()
    server.shutdown()
    if os.path.exists(HTML_TEST_FILE):
        os.remove(HTML_TEST_FILE)

    if not test_results:
        print("ERROR: Timed out waiting for test results!")
        sys.exit(1)

    print("\n" + "=" * 70)
    print("LAB TAG UPLOAD & CONSECUTIVE SLOTS TEST RESULTS:")
    print("=" * 70)
    failed = 0
    for r in test_results:
        status = "✅ [PASS]" if r['pass'] else "❌ [FAIL]"
        extra = f" ({r['extra']})" if r.get('extra') else ""
        print(f"{status} {r['name']}{extra}")
        if not r['pass']:
            failed += 1

    print(f"\nTotal Tests: {len(test_results)} | Passed: {len(test_results) - failed} | Failed: {failed}")
    if failed > 0:
        sys.exit(1)
    else:
        print("\nALL LAB TAG UPLOAD TESTS PASSED SUCCESSFULLY!")

if __name__ == '__main__':
    run_tests()
