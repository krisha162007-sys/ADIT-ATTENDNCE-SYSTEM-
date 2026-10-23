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

PORT = 8805
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

print(f"Starting Unified Elective Test Runner on port {PORT}...")
socketserver.ThreadingTCPServer.allow_reuse_address = True
httpd = socketserver.ThreadingTCPServer(("127.0.0.1", PORT), TestHandler)

server_thread = threading.Thread(target=httpd.serve_forever, daemon=True)
server_thread.start()

edge_cmd = [
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    f"--user-data-dir={os.path.join(DIR, 'temp_edge_profile_unified_electives')}",
    f"http://127.0.0.1:{PORT}/test_unified_elective_system.html"
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

# Clean temp directory
try:
    import shutil
    shutil.rmtree(os.path.join(DIR, 'temp_edge_profile_unified_electives'), ignore_errors=True)
except Exception:
    pass

if test_results:
    print("\n" + "="*70)
    print("ADIT UNIFIED ELECTIVE SYSTEM TEST SUITE EXECUTION SUMMARY:")
    print("="*70)
    if 'summary' in test_results:
        print(test_results['summary'])
    else:
        print(json.dumps(test_results, indent=2))
    
    if test_results.get('allPassed'):
        print(f"\nALL {test_results.get('passCount')} VERIFICATION TESTS COMPLETED SUCCESSFULLY!")
        sys.exit(0)
    else:
        print(f"\nUNIFIED ELECTIVE TEST SUITE FAILED! ({test_results.get('failCount')} failed)")
        sys.exit(1)
else:
    print("ERROR: Did not receive test results from Edge.")
    sys.exit(1)
