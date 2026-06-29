#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER="root@92.113.21.90"
REMOTE_PATH="/var/www/json-formatter"
BUILD_ARCHIVE="json-formatter-build.tar.gz"
DOMAIN="jsonformat.info"
SOURCE_DIR="$SCRIPT_DIR/../src"
BUILD_OUTPUT="$SOURCE_DIR/out"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/hostinger_deploy}"
SSH_OPTS=(-i "$SSH_KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=10)

echo "═══════════════════════════════════════════════════════════"
echo "  JSON Formatter Deploy"
echo "═══════════════════════════════════════════════════════════"

echo "→ SSH baglantisi kontrol ediliyor..."
ssh "${SSH_OPTS[@]}" "$SERVER" "echo OK" >/dev/null
echo "✓ SSH baglantisi basarili"

echo "→ Versiyon guncelleniyor..."
NEW_VERSION="$(node "$SCRIPT_DIR/bump-version.mjs" "$SOURCE_DIR/package.json")"
echo "✓ Yeni versiyon: v$NEW_VERSION"

echo "→ npm install..."
(cd "$SOURCE_DIR" && npm install)

echo "→ Build aliniyor..."
rm -rf "$BUILD_OUTPUT"
(cd "$SOURCE_DIR" && npm run build)

echo "→ Arsivleniyor..."
ARCHIVE_PATH="$SCRIPT_DIR/$BUILD_ARCHIVE"
rm -f "$ARCHIVE_PATH"
(cd "$BUILD_OUTPUT" && tar -czf "$ARCHIVE_PATH" .)

echo "→ Sunucuya yukleniyor..."
scp "${SSH_OPTS[@]}" "$ARCHIVE_PATH" "${SERVER}:${REMOTE_PATH}/"

echo "→ Sunucuda cikartiliyor..."
ssh "${SSH_OPTS[@]}" "$SERVER" "cd $REMOTE_PATH && tar -xzf $BUILD_ARCHIVE && rm $BUILD_ARCHIVE && chown -R www-data:www-data $REMOTE_PATH"

echo "→ nginx yeniden yukleniyor..."
ssh "${SSH_OPTS[@]}" "$SERVER" "nginx -t && systemctl reload nginx"

rm -f "$ARCHIVE_PATH"

echo "✓ Deploy tamamlandi: https://${DOMAIN}/ (v${NEW_VERSION})"
