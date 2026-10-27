import http.server
import socketserver
import json
import subprocess
import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

PORT = 8815
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

print(f"Starting College-Wide Attendance Test Runner on port {PORT}...")
with socketserver.TCPServer(("127.0.0.1", PORT), TestHandler) as httpd:
    httpd.timeout = 35

    edge_cmd = [
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        f"http://127.0.0.1:{PORT}/test_college_wide_departments_suite.html"
    ]

    print("Launching Edge headless...")
    proc = subprocess.Popen(edge_cmd)

    while test_results is None:
        httpd.handle_request()

    proc.terminate()

print("\n" + "=" * 70)
print("COLLEGE-WIDE ATTENDANCE & DEPARTMENTS TEST SUITE EXECUTION SUMMARY:")
print("=" * 70)

if "error" in test_results:
    print(f"FATAL SUITE ERROR: {test_results['error']}")
    if "stack" in test_results:
        print(test_results["stack"])
    sys.exit(1)

for r in test_results.get("results", []):
    status = "✅ [PASS]" if r["pass"] else "❌ [FAIL]"
    details = f" ({r['details']})" if r.get("details") else ""
    print(f"{status} {r['desc']}{details}")

print("\n" + test_results.get("summary", ""))

if test_results.get("allPassed"):
    print("\nALL COLLEGE-WIDE ATTENDANCE & ALL-DEPARTMENT TESTS PASSED SUCCESSFULLY!\n")
    sys.exit(0)
else:
    print("\nSOME TESTS FAILED!\n")
    sys.exit(1)
