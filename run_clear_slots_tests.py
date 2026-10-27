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

PORT = 8840
HTML_TEST_FILE = "test_clear_slots_suite.html"

HTML_CONTENT = """<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Timetable Clear Slots Test Suite</title>
  <script src="/libs/react.min.js"></script>
  <script src="/libs/react-dom.min.js"></script>
  <script src="/libs/lucide.min.js"></script>
  <script src="/libs/xlsx.min.js"></script>
  <script src="/libs/pdf.min.js"></script>
  <script src="/app-bundle.js?v=test_clear_1"></script>
</head>
<body>
  <div id="test-root"></div>
  <script>
    async function runTests() {
      const results = [];
      function assert(name, condition, extra = '') {
        results.push({ name, pass: !!condition, extra: String(extra) });
      }

      try {
        localStorage.clear();

        // 1. Verify existence of functions
        assert('clearAllFacultySlots is defined', typeof window.clearAllFacultySlots === 'function');
        assert('saveFacultyTimetable is defined', typeof window.saveFacultyTimetable === 'function');
        assert('clearFacultySlot is defined', typeof window.clearFacultySlot === 'function');
        assert('clearAllClassSlots is defined', typeof window.clearAllClassSlots === 'function');
        assert('saveClassTimetable is defined', typeof window.saveClassTimetable === 'function');

        // Setup test faculty
        const faculty1 = { id: 'FAC_TEST_1', name: 'Prof. Test Clear', departmentId: 'DEP_IT', department: 'Information Technology' };
        const faculty2 = { id: 'FAC_TEST_2', name: 'Prof. Other Faculty', departmentId: 'DEP_IT', department: 'Information Technology' };
        localStorage.setItem('adit_attendance_faculties', JSON.stringify([faculty1, faculty2]));

        // Setup initial timetable entries
        // Period 1 and 2: 2-hour lab session for FAC_TEST_1
        const labSessionId = 'SESSION_LAB_123';
        const entries = [
          {
            id: 'TT_1',
            sessionId: labSessionId,
            facultyId: 'FAC_TEST_1',
            facultyName: 'Prof. Test Clear',
            subjectId: 'DLD',
            subjectName: 'DLD Lab',
            semId: '1st Sem',
            divId: 'Div 1',
            departmentId: 'DEP_IT',
            day: 'Monday',
            timeSlot: '10:55 AM - 11:45 AM',
            room: 'Lab 1',
            batch: 'Batch A',
            type: 'Laboratory',
            span: 2,
            isMultiSlot: true
          },
          {
            id: 'TT_2',
            sessionId: labSessionId,
            facultyId: 'FAC_TEST_1',
            facultyName: 'Prof. Test Clear',
            subjectId: 'DLD',
            subjectName: 'DLD Lab',
            semId: '1st Sem',
            divId: 'Div 1',
            departmentId: 'DEP_IT',
            day: 'Monday',
            timeSlot: '11:50 AM - 12:40 PM',
            room: 'Lab 1',
            batch: 'Batch A',
            type: 'Laboratory',
            span: 2,
            isMultiSlot: true,
            isContinuation: true
          },
          {
            id: 'TT_3',
            facultyId: 'FAC_TEST_1',
            facultyName: 'Prof. Test Clear',
            subjectId: 'CS',
            subjectName: 'Cyber Security',
            semId: '3rd Sem',
            divId: 'Div 1',
            departmentId: 'DEP_IT',
            day: 'Tuesday',
            timeSlot: '09:00 AM - 09:55 AM',
            room: 'Room 201',
            batch: 'ALL',
            type: 'Lecture',
            span: 1
          },
          {
            id: 'TT_4',
            facultyId: 'FAC_TEST_2',
            facultyName: 'Prof. Other Faculty',
            subjectId: 'MATHS',
            subjectName: 'Mathematics',
            semId: '1st Sem',
            divId: 'Div 1',
            departmentId: 'DEP_IT',
            day: 'Monday',
            timeSlot: '10:55 AM - 11:45 AM',
            room: 'Room 101',
            batch: 'ALL',
            type: 'Lecture',
            span: 1
          }
        ];
        localStorage.setItem('adit_timetable_entries', JSON.stringify(entries));

        // Test 2: Clear 2-hour lab slot by sessionId or period
        let updatedGrid = window.clearFacultySlot('FAC_TEST_1', 'Monday', '10:55 AM - 11:45 AM', labSessionId);
        let remaining = JSON.parse(localStorage.getItem('adit_timetable_entries') || '[]');
        
        const hasLabPeriod1 = remaining.some(e => e.id === 'TT_1' || (e.day === 'Monday' && e.timeSlot === '10:55 AM - 11:45 AM' && e.facultyId === 'FAC_TEST_1'));
        const hasLabPeriod2 = remaining.some(e => e.id === 'TT_2' || (e.day === 'Monday' && e.timeSlot === '11:50 AM - 12:40 PM' && e.facultyId === 'FAC_TEST_1'));
        assert('2-hour lab Period 1 removed', !hasLabPeriod1);
        assert('2-hour lab Period 2 (continuation) removed', !hasLabPeriod2);
        assert('Other lecture for FAC_TEST_1 remains', remaining.some(e => e.id === 'TT_3'));
        assert('FAC_TEST_2 entries untouched', remaining.some(e => e.id === 'TT_4'));

        // Test 3: Clear all slots for FAC_TEST_1
        const emptyGrid = window.clearAllFacultySlots('FAC_TEST_1', 'Prof. Test Clear');
        remaining = JSON.parse(localStorage.getItem('adit_timetable_entries') || '[]');
        const hasAnyFac1 = remaining.some(e => e.facultyId === 'FAC_TEST_1' || e.facultyName === 'Prof. Test Clear');
        assert('clearAllFacultySlots cleared all slots for FAC_TEST_1', !hasAnyFac1);
        assert('FAC_TEST_2 entries still preserved', remaining.some(e => e.id === 'TT_4'));
        assert('Empty grid returned with timetable days', !!emptyGrid && typeof emptyGrid === 'object' && 'Monday' in emptyGrid);

        // Test 4: saveFacultyTimetable({}) acts as clearAllFacultySlots
        // Add a slot back for FAC_TEST_1
        remaining.push({
          id: 'TT_5',
          facultyId: 'FAC_TEST_1',
          facultyName: 'Prof. Test Clear',
          subjectId: 'AI',
          subjectName: 'Artificial Intelligence',
          semId: '5th Sem',
          divId: 'Div 1',
          departmentId: 'DEP_IT',
          day: 'Wednesday',
          timeSlot: '09:00 AM - 09:55 AM',
          room: 'Room 301',
          batch: 'ALL',
          type: 'Lecture',
          span: 1
        });
        localStorage.setItem('adit_timetable_entries', JSON.stringify(remaining));

        window.saveFacultyTimetable('FAC_TEST_1', {});
        remaining = JSON.parse(localStorage.getItem('adit_timetable_entries') || '[]');
        const hasFac1AfterSaveEmpty = remaining.some(e => e.facultyId === 'FAC_TEST_1');
        assert('saveFacultyTimetable with empty object clears all slots', !hasFac1AfterSaveEmpty);
        assert('FAC_TEST_2 entries still preserved after save empty', remaining.some(e => e.id === 'TT_4'));

      } catch (err) {
        assert('Execution failed with uncaught error: ' + err.message, false, err.stack);
      }

      // Send results to test runner
      fetch('/api/test-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(results)
      });
    }

    window.addEventListener('DOMContentLoaded', runTests);
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

    print(f"Starting Timetable Clear Slots Test Runner on port {PORT}...")
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
    while test_results is None and (time.time() - start) < 20:
        time.sleep(0.5)

    edge_process.terminate()
    server.shutdown()
    if os.path.exists(HTML_TEST_FILE):
        os.remove(HTML_TEST_FILE)

    if not test_results:
        print("ERROR: Timed out waiting for test results!")
        sys.exit(1)

    print("\n" + "=" * 70)
    print("TIMETABLE CLEAR SLOTS TEST RESULTS:")
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
        print("\nALL TIMETABLE CLEAR SLOTS TESTS PASSED SUCCESSFULLY!")

if __name__ == '__main__':
    run_tests()
