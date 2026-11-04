#!/usr/bin/env bash
set -euo pipefail
release_id="${1:?release id required}"
[[ "$release_id" =~ ^[0-9]{14}$ ]] || exit 2
root=/opt/nobi-racing
release="$root/releases/$release_id"
archive="/home/ubuntu/nobi-racing-$release_id.tgz"
[[ -f "$archive" ]] || exit 2
mkdir -p "$root/releases" "$root/runtime" "$release"
if [[ ! -x "$root/runtime/bin/node" ]]; then
  work=$(mktemp -d /tmp/nobi-racing-node.XXXXXX)
  curl -fsS --retry 2 --max-time 120 https://nodejs.org/dist/v24.19.0/SHASUMS256.txt -o "$work/SHASUMS256.txt"
  curl -fsS --retry 2 --max-time 180 https://nodejs.org/dist/v24.19.0/node-v24.19.0-linux-x64.tar.xz -o "$work/node-v24.19.0-linux-x64.tar.xz"
  (cd "$work" && grep ' node-v24.19.0-linux-x64.tar.xz$' SHASUMS256.txt | sha256sum -c -)
  tar --no-same-owner --strip-components=1 -xJf "$work/node-v24.19.0-linux-x64.tar.xz" -C "$root/runtime"
fi
tar --no-same-owner -xzf "$archive" -C "$release"
chmod -R a+rX "$release" "$root/runtime"
previous=$(readlink "$root/current" || true)
# In-flight web tabs may still request a lazy chunk from the previous entry point.
# Keep recent immutable assets so returning after deployment cannot hit a chunk 404.
if [[ "$previous" =~ ^/opt/nobi-racing/releases/[0-9]{14}$ ]] && [[ -d "$previous/web/assets" ]]; then
  mkdir -p "$release/web/assets"
  find "$previous/web/assets" -maxdepth 1 -type f -mmin -2880 -exec cp -p --update=none -- {} "$release/web/assets/" \;
fi
ln -sfn "$release" "$root/current.next"
mv -Tf "$root/current.next" "$root/current"
install -m 644 "$release/infra/nobi-racing-public.service" /etc/systemd/system/nobi-racing-public.service
systemctl daemon-reload
systemctl enable --now nobi-racing-public.service
systemctl restart nobi-racing-public.service
ready=false
for attempt in $(seq 1 45); do
  status=$(curl -fsS --max-time 3 http://127.0.0.1:5292/api/v1/public-reference || true)
  if printf '%s' "$status" | grep -q '"status":"ready"'; then ready=true; break; fi
  sleep 2
done
if [[ "$ready" != true ]]; then
  journalctl -u nobi-racing-public.service -n 12 --no-pager
  if [[ -n "$previous" ]]; then ln -sfn "$previous" "$root/current"; systemctl restart nobi-racing-public.service; fi
  exit 3
fi
site=/etc/nginx/conf.d/supabase-proxy.conf
backup="$root/nginx-backup-$release_id.conf"
cp "$site" "$backup"
install -m 644 "$release/infra/nobi-racing-nginx.conf" /etc/nginx/snippets/nobi-racing.conf
python3 - "$site" <<'PY'
import pathlib,sys
path=pathlib.Path(sys.argv[1]);text=path.read_text();line='    include /etc/nginx/snippets/nobi-racing.conf;'
if line not in text:
    needle='    include /etc/nginx/snippets/nobi-auth.conf;'
    if text.count(needle)!=1:raise SystemExit('Unexpected existing site structure; manual review required')
    path.write_text(text.replace(needle,needle+'\n'+line))
PY
if ! nginx -t; then cp "$backup" "$site"; exit 4; fi
systemctl reload nginx
printf 'Released NOBI Racing %s at https://api.nobistudio.com/racing/\n' "$release_id"
