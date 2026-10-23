import http.server
import socketserver
import json
import subprocess
import os
import sys
import threading
import time

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

PORT = 8816
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

    def log_message(self, format, *args):
        pass

print(f"Starting Multi-Lecture & Exception Test Runner on port {PORT}...")
socketserver.ThreadingTCPServer.allow_reuse_address = True
httpd = socketserver.ThreadingTCPServer(("127.0.0.1", PORT), TestHandler)

server_thread = threading.Thread(target=httpd.serve_forever, daemon=True)
server_thread.start()

edge_paths = [
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"
]
edge_bin = next((p for p in edge_paths if os.path.exists(p)), None)
if not edge_bin:
    print("Edge binary not found.")
    sys.exit(1)

profile_dir = os.path.join(DIR, 'temp_edge_profile_multilec')
if os.path.exists(profile_dir):
    try:
        import shutil
        shutil.rmtree(profile_dir, ignore_errors=True)
    except Exception:
        pass

edge_cmd = [
    edge_bin,
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--no-first-run",
    "--no-default-browser-check",
    f"--user-data-dir={profile_dir}",
    f"http://127.0.0.1:{PORT}/test_multi_lecture_and_exception_suite.html?v={int(time.time())}"
]

print("Launching Edge headless...")
proc = subprocess.Popen(edge_cmd)

start_time = time.time()
while test_results is None and (time.time() - start_time) < 25:
    time.sleep(0.5)

try:
    proc.terminate()
except Exception:
    pass

try:
    httpd.shutdown()
except Exception:
    pass

try:
    import shutil
    shutil.rmtree(profile_dir, ignore_errors=True)
except Exception:
    pass

if test_results:
    print("\n" + "=" * 80)
    print("MULTI-LECTURE & ATTENDANCE EXCEPTION TEST SUITE EXECUTION SUMMARY:")
    print("=" * 80)
    for r in test_results.get('results', []):
        print(r['text'])
    print("=" * 80)
    if test_results.get('allPassed'):
        print(f"ALL {test_results.get('total')} CHECKS PASSED SUCCESSFULLY WITH ZERO FAILURES!")
        sys.exit(0)
    else:
        print(f"TESTS FAILED: {test_results.get('failed')} of {test_results.get('total')} checks failed.")
        sys.exit(1)
else:
    print("ERROR: Test suite execution timed out without receiving results.")
    sys.exit(1)
