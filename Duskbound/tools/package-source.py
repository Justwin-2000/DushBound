"""Package only the reproducible project source; never include toolchains or signing keys."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json

root = Path(__file__).resolve().parents[1]
version = json.loads((root / 'package.json').read_text(encoding='utf-8'))['version']
target = root / 'releases' / f'暮边镇-{version}-源码.zip'
excluded = {'.git', 'node_modules', 'dist', 'releases', 'keys', 'build', 'output', 'placeholder'}
target.parent.mkdir(parents=True, exist_ok=True)
with ZipFile(target, 'w', ZIP_DEFLATED, compresslevel=8) as archive:
    for source in sorted(root.rglob('*')):
        relative = source.relative_to(root)
        if not source.is_file() or any(part in excluded for part in relative.parts):
            continue
        archive.write(source, Path('Duskbound') / relative)
print(target)
