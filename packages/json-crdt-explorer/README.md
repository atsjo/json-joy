# `@jsonjoy.com/json-crdt-explorer`

This package contains an explorer site for testing and demonstrating JSON CRDTs. It includes a simple React app that allows you to create and edit JSON documents collaboratively, using json-joy's CRDT implementations under the hood.


## Development

```sh
yarn workspace @jsonjoy.com/json-crdt-explorer dev
```


## Deployment


### Wrangler / CloudFlare Pages

**New scripts in package.json:**

```sh
yarn workspace @jsonjoy.com/json-crdt-explorer deploy           # build + deploy to production
yarn workspace @jsonjoy.com/json-crdt-explorer deploy:preview    # build + deploy to preview branch
```

**What Wrangler publishes:** the entire `dist/` folder (the static build output).
It's a direct upload of assets to Cloudflare's edge network — no server needed.

**Key commands to know:**

| Command | Purpose |
|---|---|
| `npx wrangler login` | Authenticate (one-time) |
| `npx wrangler pages project create` | Create the CF Pages project (one-time) |
| `npx wrangler pages deploy dist` | Deploy `dist/` to production |
| `npx wrangler pages deploy dist --branch=preview` | Deploy to a preview URL |
| `npx wrangler pages deployment list` | List all deployments |
