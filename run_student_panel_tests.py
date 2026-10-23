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

    def log_message(self, format, *args):
        pass

print(f"Starting Student Panel Test Runner on port {PORT}...")
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

profile_dir = os.path.join(DIR, 'temp_edge_profile_student')
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
    f"http://127.0.0.1:{PORT}/test_student_panel_suite.html?v={int(time.time())}"
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
    print("\n" + "=" * 75)
    print("ADIT STUDENT PANEL TEST SUITE EXECUTION SUMMARY:")
    print("=" * 75)
    all_passed = True
    for r in test_results.get('results', []):
        safe_text = r['text'].encode('ascii', errors='replace').decode('ascii')
        print(safe_text)
        if not r.get('pass'):
            all_passed = False

    print("=" * 75)
    if all_passed:
        print("ALL STUDENT PANEL ACCEPTANCE CRITERIA PASSED SUCCESSFULLY!")
        sys.exit(0)
    else:
        print("TEST SUITE FAILED!")
        sys.exit(1)
else:
    print("ERROR: Did not receive test results from Edge.")
    sys.exit(1)
