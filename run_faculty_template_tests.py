import http.server
import socketserver
import json
import subprocess
import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

PORT = 8806
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

print(f"Starting Official Faculty Template Test Runner on port {PORT}...")
with socketserver.TCPServer(("127.0.0.1", PORT), TestHandler) as httpd:
    httpd.timeout = 30

    edge_cmd = [
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        "--headless=new",
        "--disable-gpu",
        "--no-first-run",
        "--no-default-browser-check",
        f"--user-data-dir={os.path.join(DIR, 'temp_edge_profile_template')}",
        f"http://127.0.0.1:{PORT}/test_faculty_template_suite.html"
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
    shutil.rmtree(os.path.join(DIR, 'temp_edge_profile_template'), ignore_errors=True)
except Exception:
    pass

print("\n" + "=" * 70)
print("OFFICIAL FACULTY TEMPLATE TEST SUITE EXECUTION SUMMARY:")
print("=" * 70)
if test_results:
    print(f"Total Tests: {test_results['total']} | Passed: {test_results['passed']} | Failed: {test_results['failed']}")
    for r in test_results['results']:
        status = "✅ [PASS]" if r['pass'] else "❌ [FAIL]"
        print(f"{status} {r['msg']}")

    if test_results['failed'] == 0:
        print("\nALL OFFICIAL FACULTY TEMPLATE TESTS PASSED SUCCESSFULLY!")
        sys.exit(0)
    else:
        print("\nSOME TESTS FAILED!")
        sys.exit(1)
else:
    print("NO RESULTS RECEIVED FROM TEST RUNNER!")
    sys.exit(1)
