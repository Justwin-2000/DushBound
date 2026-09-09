"""Compare packaged asset bytes with web/. This does not execute Android."""
from collections import Counter
from hashlib import sha256
from pathlib import Path
from zipfile import ZipFile
import json
import sys

root = Path(__file__).resolve().parents[1]
version = json.loads((root / 'package.json').read_text(encoding='utf-8'))['version']
apk = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else root / 'releases' / f'暮边镇-{version}.apk'
web = root / 'web'
# 与 android/build.ps1 的 Add-Assets 保持一致：开发源码与提示词不进 APK。
SKIP_TOP_LEVEL = {'src'}
SKIP_SUFFIXES = ('.prompt.txt',)


def is_packaged(name: str) -> bool:
    return name.split('/')[0] not in SKIP_TOP_LEVEL and not name.endswith(SKIP_SUFFIXES)


expected = {
    source.relative_to(web).as_posix(): source
    for source in web.rglob('*')
    if source.is_file() and is_packaged(source.relative_to(web).as_posix())
}
with ZipFile(apk) as archive:
    entries = [entry.filename for entry in archive.infolist() if entry.filename.startswith('assets/') and not entry.is_dir()]
    # 条目名必须是正斜杠：反斜杠会让 Android 的 AssetManager 在真机上查不到资源。
    backslash_entries = sorted(name for name in entries if '\\' in name)
    actual = {entry.removeprefix('assets/'): entry for entry in entries}
    missing = sorted(set(expected) - set(actual))
    extra = sorted(set(actual) - set(expected))
    changed = [name for name in sorted(set(actual) & set(expected)) if archive.read(actual[name]) != expected[name].read_bytes()]
    duplicate = sorted(name for name, count in Counter(entries).items() if count != 1)
report = {
    'verification': 'Byte-for-byte APK asset comparison; not an Android runtime test',
    'apk': str(apk),
    'apkSha256': sha256(apk.read_bytes()).hexdigest(),
    'source': str(web),
    'sourceFileCount': len(expected),
    'packagedFileCount': len(actual),
    'missing': missing,
    'extra': extra,
    'changed': changed,
    'duplicateEntries': duplicate,
    'backslashEntries': backslash_entries,
    'passed': not (missing or extra or changed or duplicate or backslash_entries),
}
output = root / 'tests' / 'output'
output.mkdir(parents=True, exist_ok=True)
(output / 'apk-assets-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(report, ensure_ascii=True, indent=2))
sys.exit(0 if report['passed'] else 1)
