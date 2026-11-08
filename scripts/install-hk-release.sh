#!/usr/bin/env bash
set -euo pipefail
release_id="${1:?release id required}"
[[ "$release_id" =~ ^[0-9]{14}$ ]] || exit 2
root=/opt/nobi-racing
release="$root/releases/$release_id"
archive="/home/ubuntu/nobi-racing-$release_id.tgz"
[[ -f "$archive" ]] || exit 2
if [[ -n "${2:-}" ]]; then
  [[ "$2" =~ ^[a-f0-9]{64}$ ]] || exit 2
  printf '%s  %s\n' "$2" "$archive" | sha256sum -c -
fi
previous=$(readlink "$root/current" || true)
[[ -z "$previous" || "$previous" =~ ^/opt/nobi-racing/releases/[0-9]{14}$ ]] || exit 2
backup_dir="$root/deployment-backups/$release_id"
mkdir -p "$backup_dir"
public_unit=/etc/systemd/system/nobi-racing-public.service
translation_unit=/etc/systemd/system/nobi-racing-translation.service
snippet=/etc/nginx/snippets/nobi-racing.conf
for file in "$public_unit" "$translation_unit" "$snippet"; do
  if [[ -f "$file" ]]; then cp -p "$file" "$backup_dir/$(basename "$file")"; fi
done
translation_was_active=$(systemctl is-active nobi-racing-translation.service || true)
translation_was_enabled=$(systemctl is-enabled nobi-racing-translation.service 2>/dev/null || true)
changed=false
rollback() {
  local status=$?
  trap - EXIT
  if [[ "$status" != 0 && "$changed" == true ]]; then
    printf 'Readiness failed; rolling back only NOBI Racing release, units and snippet.\n' >&2
    set +e
    if [[ -n "$previous" ]]; then ln -sfn "$previous" "$root/current.rollback"; mv -Tf "$root/current.rollback" "$root/current"; fi
    for file in "$public_unit" "$translation_unit" "$snippet"; do
      saved="$backup_dir/$(basename "$file")"
      if [[ -f "$saved" ]]; then cp -p "$saved" "$file"; fi
    done
    if [[ ! -f "$backup_dir/nobi-racing-translation.service" ]]; then
      systemctl disable --now nobi-racing-translation.service
      rm -f -- "$translation_unit"
    fi
    systemctl daemon-reload
    if [[ -f "$backup_dir/nobi-racing-translation.service" ]]; then
      if [[ "$translation_was_active" == active ]]; then systemctl restart nobi-racing-translation.service; else systemctl stop nobi-racing-translation.service; fi
      if [[ "$translation_was_enabled" != enabled ]]; then systemctl disable nobi-racing-translation.service; fi
    fi
    if [[ -n "$previous" ]]; then systemctl restart nobi-racing-public.service; fi
    if nginx -t; then systemctl reload nginx; fi
  fi
  exit "$status"
}
trap rollback EXIT
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
if [[ -d "$release/translation" ]]; then
  [[ -f "$release/infra/install-hk-translation.sh" ]] || exit 2
  changed=true
  bash "$release/infra/install-hk-translation.sh" "$release"
fi
# In-flight web tabs may still request a lazy chunk from the previous entry point.
# Keep recent immutable assets so returning after deployment cannot hit a chunk 404.
if [[ "$previous" =~ ^/opt/nobi-racing/releases/[0-9]{14}$ ]] && [[ -d "$previous/web/assets" ]]; then
  mkdir -p "$release/web/assets"
  find "$previous/web/assets" -maxdepth 1 -type f -mmin -2880 -exec cp -p --update=none -- {} "$release/web/assets/" \;
fi
ln -sfn "$release" "$root/current.next"
changed=true
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
  exit 3
fi
if [[ -d "$release/translation" ]]; then
  media_ready=false
  for attempt in $(seq 1 60); do
    if curl -fsS --max-time 5 http://127.0.0.1:5292/api/v1/newsroom | python3 -c 'import json,sys; d=json.load(sys.stdin); m=d.get("media",{}); assert m.get("status")=="ready" and len(m.get("photos",[]))>0 and len(m.get("videos",[]))>0' 2>/dev/null; then media_ready=true; break; fi
    sleep 2
  done
  [[ "$media_ready" == true ]] || { printf 'Official news media failed readiness.\n' >&2; exit 3; }
fi
# This host already routes /racing through its own snippet. Do not rewrite the
# shared virtual host or any other application's configuration during an update.
grep -Fq 'include /etc/nginx/snippets/nobi-racing.conf;' /etc/nginx/conf.d/supabase-proxy.conf
install -m 644 "$release/infra/nobi-racing-nginx.conf" /etc/nginx/snippets/nobi-racing.conf
nginx -t
systemctl reload nginx
printf 'Released NOBI Racing %s at https://api.nobistudio.com/racing/\n' "$release_id"
