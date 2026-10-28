"""
STEP 7: Comprehensive Cross-Device Cloud Firestore Verification Test
Simulates Device A (Admin on Laptop/Desktop) and Device B (Faculty on Mobile/Other Laptop)
to prove that data created or updated on one device seamlessly synchronizes to the other,
faculty IDs remain 100% persistent and identical, and attendance sessions propagate.
"""

import os
import subprocess
import sys

def run_multi_device_test():
    node_exe = os.path.join(os.getcwd(), 'node_env', 'Scripts', 'node.exe')
    if not os.path.exists(node_exe):
        node_exe = 'node'

    test_file_path = os.path.join(os.getcwd(), 'test_step7_runner.cjs')
    result = subprocess.run([node_exe, test_file_path], capture_output=True, text=True)
    print(result.stdout)
    if result.stderr:
        print("STDERR:\n", result.stderr)

    if result.returncode != 0:
        sys.exit(result.returncode)

if __name__ == '__main__':
    run_multi_device_test()
