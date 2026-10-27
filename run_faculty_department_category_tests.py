import http.server
import socketserver
import json
import subprocess
import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

PORT = 8820
DIR = os.path.dirname(os.path.abspath(__file__))

test_results = None

class TestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIR, **kwargs)

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
            self.send_error(404)

print(f"Starting Faculty Department Category & Timetable Department Test Runner on port {PORT}...")
with socketserver.TCPServer(("127.0.0.1", PORT), TestHandler) as httpd:
    httpd.timeout = 35

    edge_cmd = [
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        "--headless=new",
        "--disable-gpu",
        "--no-first-run",
        "--no-default-browser-check",
        f"--user-data-dir={os.path.join(DIR, 'temp_edge_profile_deptcat')}",
        f"http://127.0.0.1:{PORT}/test_faculty_department_category_suite.html"
    ]
    print("Launching Edge headless...")
    proc = subprocess.Popen(edge_cmd)

    while test_results is None:
        httpd.handle_request()

    try:
        proc.terminate()
    except Exception:
        pass

# Clean temp directory
try:
    import shutil
    shutil.rmtree(os.path.join(DIR, 'temp_edge_profile_deptcat'), ignore_errors=True)
except Exception:
    pass

if not test_results:
    print("FAILED: No test results received within timeout!")
    sys.exit(1)

if "error" in test_results:
    print(f"FATAL SUITE ERROR: {test_results['error']}")
    if "stack" in test_results:
        print(test_results["stack"])
    sys.exit(1)

print("\n" + "=" * 70)
print("FACULTY DEPARTMENT CATEGORIES & TIMETABLE DEPARTMENT HANDLING TEST RESULTS:")
print("=" * 70)

all_passed = True
total = len(test_results.get("results", []))
passed = 0
failed = 0

for res in test_results.get("results", []):
    name = res.get("name", "Unknown Test")
    did_pass = res.get("passed", False)
    extra = res.get("extra", "")
    if did_pass:
        passed += 1
        print(f"✅ [PASS] {name} {f'({extra})' if extra else ''}")
    else:
        failed += 1
        all_passed = False
        print(f"❌ [FAIL] {name} {f'({extra})' if extra else ''}")

print("\n" + f"Total Tests: {total} | Passed: {passed} | Failed: {failed}")

if all_passed and total > 0:
    print("\nALL FACULTY DEPARTMENT CATEGORY & TIMETABLE DEPARTMENT TESTS PASSED SUCCESSFULLY!")
    sys.exit(0)
else:
    print(f"\n{failed} TEST(S) FAILED!")
    sys.exit(1)
