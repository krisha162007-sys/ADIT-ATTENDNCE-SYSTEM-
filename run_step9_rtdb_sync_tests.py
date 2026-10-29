"""
STEP 9: Actual Cross-Device Firebase Realtime Database Verification Test
Runs multi-device tests with actual reads/writes against the Realtime Database engine,
verifies persistent canonical faculty IDs, 2-hour lab slots, attendance sessions,
pre-migration backups, overwrite safeguards, and security rules.
"""

import os
import subprocess
import sys

def run_tests():
    node_exe = os.path.join(os.getcwd(), 'node_env', 'Scripts', 'node.exe')
    if not os.path.exists(node_exe):
        node_exe = 'node'

    test_file_path = os.path.join(os.getcwd(), 'test_step9_runner.cjs')
    result = subprocess.run([node_exe, test_file_path], capture_output=True, text=True)
    print(result.stdout)
    if result.stderr:
        print("STDERR:\n", result.stderr)

    if result.returncode != 0:
        sys.exit(result.returncode)

if __name__ == '__main__':
    run_tests()
