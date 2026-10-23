import http.server
import socketserver
import threading
import json
import subprocess
import time
import sys
import os

PORT = 8802
results_received = None
server_instance = None

class TestHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        global results_received
        if self.path == '/api/test-results':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            results_received = json.loads(post_data.decode('utf-8'))
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status":"ok"}')
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        sys.stderr.write("%s - - [%s] %s\n" %
                         (self.address_string(),
                          self.log_date_time_string(),
                          format%args))

def start_server():
    global server_instance
    socketserver.TCPServer.allow_reuse_address = True
    server_instance = socketserver.TCPServer(('127.0.0.1', PORT), TestHandler)
    server_instance.serve_forever()

if __name__ == '__main__':
    t = threading.Thread(target=start_server, daemon=True)
    t.start()
    print(f"Starting test runner on port {PORT}...")

    edge_paths = [
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"
    ]
    edge_bin = next((p for p in edge_paths if os.path.exists(p)), None)
    if not edge_bin:
        print("Microsoft Edge not found.")
        sys.exit(1)

    print("Launching Edge headless...")
    profile_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'temp_edge_profile_ui')
    if os.path.exists(profile_dir):
        try:
            import shutil
            shutil.rmtree(profile_dir, ignore_errors=True)
        except Exception:
            pass

    cmd = [
        edge_bin,
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-cache",
        f"--user-data-dir={profile_dir}",
        f"http://127.0.0.1:{PORT}/test_take_attendance_ui_suite.html?v={int(time.time())}"
    ]
    proc = subprocess.Popen(cmd)

    start_wait = time.time()
    while results_received is None and (time.time() - start_wait) < 30:
        time.sleep(0.5)

    try:
        proc.kill()
    except Exception:
        pass

    if results_received is None:
        print("FAILED: Timed out waiting for test results!")
        sys.exit(1)

    print("\n" + "=" * 70)
    print("TAKE ATTENDANCE MULTI-COLUMN UI TEST SUITE EXECUTION SUMMARY:")
    print("=" * 70)
    for r in results_received.get('results', []):
        safe_text = r['text'].encode('ascii', errors='replace').decode('ascii')
        print(safe_text)

    if results_received.get('error'):
        print("\nERROR TRACE:")
        print(results_received['error'])

    if results_received.get('allPassed'):
        print("\nALL 10 VERIFICATION TESTS COMPLETED SUCCESSFULLY!")
        sys.exit(0)
    else:
        print("\nSOME TESTS FAILED!")
        sys.exit(1)
