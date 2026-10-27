import http.server
import socketserver
import json
import subprocess
import os
import sys
import shutil

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

PORT = 8835
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

print(f"Starting No-Duplicate-Batches Test Runner on port {PORT}...")
with socketserver.TCPServer(("127.0.0.1", PORT), TestHandler) as httpd:
    httpd.timeout = 30

    temp_profile = os.path.join(DIR, 'temp_edge_profile_nodupbatch')
    edge_cmd = [
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        "--headless=new",
        "--disable-gpu",
        "--no-first-run",
        "--no-default-browser-check",
        f"--user-data-dir={temp_profile}",
        f"http://127.0.0.1:{PORT}/test_no_duplicate_batches_suite.html"
    ]
    print("Launching Edge headless...")
    proc = subprocess.Popen(edge_cmd)

    while test_results is None:
        httpd.handle_request()

    try:
        proc.terminate()
    except Exception:
        pass

try:
    shutil.rmtree(temp_profile, ignore_errors=True)
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
print("NO DUPLICATE BATCH OPTIONS TEST RESULTS:")
print("=" * 70)

failures = 0
for r in test_results.get("results", []):
    status = "✅ [PASS]" if r["pass"] else "❌ [FAIL]"
    extra = f" ({r['extra']})" if r.get("extra") else ""
    print(f"{status} {r['name']} {extra}")
    if not r["pass"]:
        failures += 1

print("\n" + test_results.get("summary", ""))

if failures > 0:
    print(f"\n{failures} TEST(S) FAILED!")
    sys.exit(1)
else:
    print("\nALL NO DUPLICATE BATCHES TESTS PASSED SUCCESSFULLY!")
    sys.exit(0)
