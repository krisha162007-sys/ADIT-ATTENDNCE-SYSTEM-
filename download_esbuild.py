"""
Downloads esbuild.exe for Windows x64 from npm registry.
"""
import urllib.request
import tarfile
import os
import json

OUT_EXE = 'esbuild.exe'

def download_esbuild():
    if os.path.exists(OUT_EXE) and os.path.getsize(OUT_EXE) > 1_000_000:
        print(f'esbuild.exe already exists ({os.path.getsize(OUT_EXE):,} bytes)')
        return True

    # Get the latest version from npm registry
    print('Fetching esbuild version info from npm...')
    req = urllib.request.Request('https://registry.npmjs.org/@esbuild/win32-x64', headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=30) as r:
        meta = json.loads(r.read())

    latest = meta['dist-tags']['latest']
    tgz_url = meta['versions'][latest]['dist']['tarball']
    print(f'Downloading esbuild v{latest} from {tgz_url}...')

    tgz_file = 'esbuild_tmp.tgz'
    req2 = urllib.request.Request(tgz_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req2, timeout=60) as r:
        data = r.read()
    with open(tgz_file, 'wb') as f:
        f.write(data)
    print(f'Downloaded {len(data):,} bytes')

    with tarfile.open(tgz_file, 'r:gz') as tar:
        for member in tar.getmembers():
            print(f'  tgz entry: {member.name}')
            if member.name.endswith('.exe'):
                f = tar.extractfile(member)
                with open(OUT_EXE, 'wb') as out:
                    out.write(f.read())
                print(f'Extracted esbuild.exe ({os.path.getsize(OUT_EXE):,} bytes)')
                break

    os.remove(tgz_file)
    return os.path.exists(OUT_EXE)

if __name__ == '__main__':
    try:
        ok = download_esbuild()
        print('SUCCESS' if ok else 'FAILED')
    except Exception as e:
        print(f'ERROR: {e}')
        import traceback; traceback.print_exc()
