# Quill editor collaborative editing binding

Makes a rich-text Quill editor instance collaborative by binding it to a JSON CRDT
document using the `quill` extension. This allows multiple users to edit the
same document json-joy JSON CRDT document concurrently through the Quill editor.

![collab-quill-demo](https://github.com/user-attachments/assets/22bae7b3-d88b-428f-95b0-cc9ee757602b)


## Usage

Installation:

```
npm install @jsonjoy.com/collaborative-quill json-joy quill quill-delta
```

Usage:

```ts
import {bind} from '@jsonjoy.com/collaborative-quill';
import {Model} from 'json-joy/lib/json-crdt';

// ...

const unbind = bind(str, editor);

// When done, unbind the binding.
unbind();
```


## React

For React components, see [`@jsonjoy.com/collaborative-quill-react`](../collaborative-quill-react).


## Preview

- See [demo](https://streamich.github.io/collaborative-quill).

## Funding

This project is funded through [NGI Zero Core](https://nlnet.nl/core), a fund established by [NLnet](https://nlnet.nl) with financial support from the European Commission's [Next Generation Internet](https://ngi.eu) program. Learn more at the [NLnet project page](https://nlnet.nl/project/JSON-Joy-Peritext).

[<img src="https://nlnet.nl/logo/banner.png" alt="NLnet foundation logo" width="20%" />](https://nlnet.nl)
[<img src="https://nlnet.nl/image/logos/NGI0_tag.svg" alt="NGI Zero Logo" width="20%" />](https://nlnet.nl/core)

