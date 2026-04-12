// PM2 process config for json-crdt-server.
// Deployed to: /srv/json-crdt-server/ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'json-crdt-server',
      script: './lib/main.js',
      cwd: '/srv/json-crdt-server',
      instances: 1, // LevelDB is not multi-process safe
      exec_mode: 'fork',
      watch: false,
      restart_delay: 2000,
      max_memory_restart: '3072M',
      env: {
        NODE_ENV: 'production',
        PORT: '443',
        JSON_CRDT_STORE: 'level',
        JSON_CRDT_STORE_PATH: '/var/lib/json-crdt-server/db',
        SSL_KEY: '/etc/letsencrypt/live/pub-1.api.jsoncrdt.org/privkey.pem',
        SSL_CRT: '/etc/letsencrypt/live/pub-1.api.jsoncrdt.org/fullchain.pem',
      },
    },
  ],
};
