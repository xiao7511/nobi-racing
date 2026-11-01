#!/usr/bin/env bash
set -euo pipefail
: "${IOS_DISTRIBUTION_P12_BASE64:?Missing encrypted signing certificate}"
: "${IOS_PROVISIONING_PROFILE_BASE64:?Missing provisioning profile}"
: "${IOS_P12_PASSWORD:?Missing certificate password}"
: "${IOS_TEAM_ID:?Missing Apple Team ID}"
app_id="${NOBI_APP_ID:-com.nobistudio.racing}"
work=$(mktemp -d)
keychain="$work/nobi-racing.keychain-db"
keychain_password=$(openssl rand -base64 24)
cleanup() { security delete-keychain "$keychain" >/dev/null 2>&1 || true; case "$work" in /var/folders/*|/tmp/*|/private/tmp/*) rm -rf "$work";; esac; }
trap cleanup EXIT
printf '%s' "$IOS_DISTRIBUTION_P12_BASE64" | base64 --decode > "$work/signing.p12"
printf '%s' "$IOS_PROVISIONING_PROFILE_BASE64" | base64 --decode > "$work/profile.mobileprovision"
security create-keychain -p "$keychain_password" "$keychain"
security set-keychain-settings -lut 21600 "$keychain"
security unlock-keychain -p "$keychain_password" "$keychain"
security import "$work/signing.p12" -k "$keychain" -P "$IOS_P12_PASSWORD" -A -t cert -f pkcs12
security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k "$keychain_password" "$keychain" >/dev/null
security list-keychains -d user -s "$keychain" "$HOME/Library/Keychains/login.keychain-db"
security cms -D -i "$work/profile.mobileprovision" > "$work/profile.plist"
profile_uuid=$(/usr/libexec/PlistBuddy -c 'Print UUID' "$work/profile.plist")
profile_name=$(/usr/libexec/PlistBuddy -c 'Print Name' "$work/profile.plist")
mkdir -p "$HOME/Library/MobileDevice/Provisioning Profiles" output/ios
cp "$work/profile.mobileprovision" "$HOME/Library/MobileDevice/Provisioning Profiles/$profile_uuid.mobileprovision"
export NOBI_EXPORT_APP_ID="$app_id" NOBI_EXPORT_TEAM_ID="$IOS_TEAM_ID" NOBI_EXPORT_PROFILE="$profile_name" NOBI_EXPORT_PATH="$work/export.plist"
python3 - <<'PY'
import os,plistlib
data={'method':'app-store-connect','destination':'export','teamID':os.environ['NOBI_EXPORT_TEAM_ID'],'signingStyle':'manual','provisioningProfiles':{os.environ['NOBI_EXPORT_APP_ID']:os.environ['NOBI_EXPORT_PROFILE']},'manageAppVersionAndBuildNumber':False,'stripSwiftSymbols':True}
with open(os.environ['NOBI_EXPORT_PATH'],'wb') as f:plistlib.dump(data,f)
PY
build_number=$((100+${BUILD_NUMBER:-1}))
xcodebuild -project apps/fan/ios/App/App.xcodeproj -scheme App -configuration Release -destination 'generic/platform=iOS' -archivePath "$work/NOBI-Racing.xcarchive" archive CODE_SIGN_STYLE=Manual DEVELOPMENT_TEAM="$IOS_TEAM_ID" PROVISIONING_PROFILE_SPECIFIER="$profile_name" CODE_SIGN_IDENTITY='Apple Distribution' CURRENT_PROJECT_VERSION="$build_number" OTHER_CODE_SIGN_FLAGS="--keychain $keychain" > output/ios/archive.log 2>&1
xcodebuild -exportArchive -archivePath "$work/NOBI-Racing.xcarchive" -exportOptionsPlist "$work/export.plist" -exportPath output/ios > output/ios/export.log 2>&1
find output/ios -maxdepth 1 -name '*.ipa' -print
