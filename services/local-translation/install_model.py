"""Install the pinned official Argos en-zh package after verifying its content hash."""
import argparse
import hashlib
from pathlib import Path
import zipfile

parser = argparse.ArgumentParser()
parser.add_argument('--archive', required=True)
args = parser.parse_args()
archive = Path(args.archive).resolve()
target = (Path(__file__).resolve().parents[2] / '.tools/translation/model').resolve()
expected = '433e7c4f034d87fbe2353161e05f18646d7999452f801a4e1f0378522b9850ab'
if hashlib.sha256(archive.read_bytes()).hexdigest() != expected:
    raise SystemExit('Translation package hash mismatch; model not installed.')
with zipfile.ZipFile(archive) as package:
    for entry in package.infolist():
        resolved = (target / entry.filename).resolve()
        if resolved != target and target not in resolved.parents:
            raise SystemExit('Unsafe package path; model not installed.')
    package.extractall(target)
print('Verified Argos en-zh 1.9 installed at ' + str(target))
