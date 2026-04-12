#!/usr/bin/env bash
#
# Usage:
#   bash packages/json-crdt-server/scripts/deploy.sh
#
# Optional — wipe the database on this deploy:
#   WIPE_DB=1 bash packages/json-crdt-server/scripts/deploy.sh

set -euo pipefail

# Ensure local node_modules/.bin (tsc, etc.) are on PATH
export PATH="$PWD/node_modules/.bin:$PATH"

DOMAIN="pub-1-api.jsonjoy.org"
HOST="78.47.129.147"
SSH_KEY="$HOME/.ssh/jsonjoy_org_deploy"
SSH="ssh -i $SSH_KEY"
SCP="scp -i $SSH_KEY"
DEPLOY_USER="deploy"
APP_DIR="/srv/json-crdt-server"
WIPE_DB="${WIPE_DB:-0}"

# 1. build
echo "==> Building"
yarn workspace @jsonjoy.com/json-crdt-server build

# 2. resolve workspace: deps to real npm versions
echo "==> Preparing package.json"
node - <<'NODEEOF'
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('packages/json-crdt-server/package.json', 'utf8'));
function resolve(deps) {
  if (!deps) return deps;
  return Object.fromEntries(Object.entries(deps).map(([name, ver]) => {
    if (!ver.startsWith('workspace:')) return [name, ver];
    const dir = name.startsWith('@jsonjoy.com/')
      ? 'packages/' + name.replace('@jsonjoy.com/', '')
      : 'packages/' + name;
    try {
      const v = JSON.parse(fs.readFileSync(dir + '/package.json', 'utf8')).version;
      return [name, '^' + v];
    } catch { return [name, '*']; }
  }));
}
pkg.dependencies = resolve(pkg.dependencies);
pkg.peerDependencies = resolve(pkg.peerDependencies);
delete pkg.devDependencies;
fs.writeFileSync('/tmp/deploy-package.json', JSON.stringify(pkg, null, 2));
NODEEOF

# 3. push artifacts
echo "==> Uploading lib/ to ${HOST}"
rsync -rlzv --delete \
  -e "ssh -i $SSH_KEY" \
  packages/json-crdt-server/lib/ \
  "${DEPLOY_USER}@${HOST}:${APP_DIR}/lib/"

echo "==> Uploading config"
scp -i "$SSH_KEY" \
  /tmp/deploy-package.json \
  "${DEPLOY_USER}@${HOST}:${APP_DIR}/package.json"
scp -i "$SSH_KEY" \
  packages/json-crdt-server/ecosystem.config.js \
  "${DEPLOY_USER}@${HOST}:${APP_DIR}/ecosystem.config.js"

# 4. install + restart
echo "==> Restarting server"
$SSH "${DEPLOY_USER}@${HOST}" "
  set -e
  export NVM_DIR=\"\$HOME/.nvm\"
  . \"\$NVM_DIR/nvm.sh\"
  cd ${APP_DIR}

  if [[ '${WIPE_DB}' == '1' ]]; then
    echo '--- wiping database'
    pm2 stop json-crdt-server || true
    rm -rf /var/lib/json-crdt-server/db
  fi

  npm install --omit=dev
  pm2 restart json-crdt-server 2>/dev/null || pm2 start ecosystem.config.js
  pm2 save
"

# 5. smoke test
echo "==> Smoke test"
sleep 2
curl -sf "https://${DOMAIN}/rpc" \
  -H 'Content-Type: rpc.rx.compact.json' \
  -d '[1,1,"util.ping"]' && echo "OK"
