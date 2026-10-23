import http.server
import socketserver
import threading
import subprocess
import time
import json
import sys
import os

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

PORT = 8820
received_results = None

class TestServerHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        global received_results
        if self.path == '/api/test-results':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            received_results = json.loads(post_data.decode('utf-8'))
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status": "ok"}')
        else:
            self.send_response(404)
            self.end_headers()

def run_server():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), TestServerHandler) as httpd:
        while received_results is None:
            httpd.handle_request()

def safe_print(text):
    try:
        print(text)
    except UnicodeEncodeError:
        print(text.encode('ascii', errors='replace').decode('ascii'))

def main():
    global received_results
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()

    time.sleep(0.5)

    edge_paths = [
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    ]
    edge_exe = next((p for p in edge_paths if os.path.exists(p)), None)
    if not edge_exe:
        safe_print("ERROR: Microsoft Edge not found")
        sys.exit(1)

    url = f"http://127.0.0.1:{PORT}/test_user_requirements_suite.html?v={int(time.time())}"
    safe_print("Launching Edge headless...")
    proc = subprocess.Popen([
        edge_exe,
        "--headless",
        "--disable-gpu",
        "--no-sandbox",
        "--disable-software-rasterizer",
        url
    ])

    start_time = time.time()
    while received_results is None and (time.time() - start_time) < 25:
        time.sleep(0.5)

    try:
        proc.kill()
    except Exception:
        pass

    if received_results is None:
        safe_print("ERROR: Test results timed out!")
        sys.exit(1)

    safe_print("\n" + "=" * 70)
    safe_print("VERIFICATION SUITE EXECUTION SUMMARY:")
    safe_print("=" * 70)
    for r in received_results.get('results', []):
        safe_print(r['text'])
    safe_print("=" * 70)

    if received_results.get('allPassed'):
        safe_print("ALL TESTS PASSED SUCCESSFULLY!")
        sys.exit(0)
    else:
        safe_print("TESTS FAILED!")
        sys.exit(1)

if __name__ == '__main__':
    main()
