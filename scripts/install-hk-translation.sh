#!/usr/bin/env bash
set -euo pipefail
release="${1:?absolute release directory required}"
[[ "$release" =~ ^/opt/nobi-racing/releases/[0-9]{14}$ ]] || exit 2
root=/opt/nobi-racing/translation
archive="$release/translation/model.argosmodel"
expected=433e7c4f034d87fbe2353161e05f18646d7999452f801a4e1f0378522b9850ab
[[ -f "$archive" && -f "$release/translation/server.py" && -f "$release/reference/names.json" ]] || exit 2
printf '%s  %s\n' "$expected" "$archive" | sha256sum -c -
mkdir -p "$root"
if [[ ! -x "$root/venv/bin/python" ]]; then python3 -m venv "$root/venv"; fi
PIP_DISABLE_PIP_VERSION_CHECK=1 "$root/venv/bin/python" -m pip install --only-binary=:all: --no-cache-dir -r "$release/translation/requirements.txt"
python3 - "$archive" "$root/model" "$expected" <<'PY'
import hashlib,pathlib,sys,zipfile
archive,target,expected=pathlib.Path(sys.argv[1]),pathlib.Path(sys.argv[2]).resolve(),sys.argv[3]
if hashlib.sha256(archive.read_bytes()).hexdigest()!=expected:raise SystemExit('Model hash mismatch')
marker=target/'verified.sha256'
if marker.is_file() and marker.read_text().strip()==expected and any(target.rglob('model.bin')):raise SystemExit(0)
target.mkdir(parents=True,exist_ok=True)
with zipfile.ZipFile(archive) as package:
    for entry in package.infolist():
        resolved=(target/entry.filename).resolve()
        if resolved!=target and target not in resolved.parents:raise SystemExit('Unsafe model archive path')
    package.extractall(target)
marker.write_text(expected+'\n')
PY
chmod -R a+rX "$root" "$release/translation"
# Pin the worker code to this prepared release so readiness runs before the API switch.
sed "s|/opt/nobi-racing/current/|$release/|g" "$release/infra/nobi-racing-translation.service" > /etc/systemd/system/nobi-racing-translation.service
systemctl daemon-reload
systemctl enable nobi-racing-translation.service
systemctl restart nobi-racing-translation.service
ready=false
for attempt in $(seq 1 30); do
  if curl -fsS --max-time 3 http://127.0.0.1:5291/health | python3 -c 'import json,sys; d=json.load(sys.stdin); assert d["status"]=="ready" and d["target"]=="zh-CN"' 2>/dev/null; then ready=true; break; fi
  sleep 2
done
[[ "$ready" == true ]] || { journalctl -u nobi-racing-translation.service -n 8 --no-pager; exit 3; }
curl -fsS --max-time 45 -H 'Content-Type: application/json' --data '{"texts":["F1 qualifying highlights from the Sao Paulo Grand Prix.","Ferrari driver Lewis Hamilton prepares for the race."],"source":"en","target":"zh-CN"}' http://127.0.0.1:5291/translate | python3 -c 'import json,re,sys; d=json.load(sys.stdin); rows=d.get("translations",[]); assert len(rows)==2 and all(isinstance(row,str) and re.search("[\u3400-\u9fff]",row) for row in rows), "Translation smoke failed"; print("Offline Simplified Chinese translation ready; two real inference samples passed")'
systemctl show nobi-racing-translation.service --property=ActiveState,SubState,NRestarts,MemoryCurrent,MemoryPeak,MemoryMax,CPUQuotaPerSecUSec
