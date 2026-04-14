# `@jsonjoy.com/json-crdt-repo`

Syncing local-first browser client for `@jsonjoy.com/json-crdt-server`. Persists
files in browser and synchronizes with the server when online. Allows offline
editing and syncing when back online.


## Usage

Create a new repository:

```typescript
import {JsonCrdtRepo} from '@jsonjoy.com/json-crdt-repo';

const repo = new JsonCrdtRepo();
const session = repo.make('my-document');

console.log(session.model.view());
// session.model is JSON CRDT model which can be manipulated
```
