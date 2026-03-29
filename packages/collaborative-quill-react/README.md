# Collaborative Quill Editor React Component

React component for collaborative editing in Quill Editor. Connects JSON CRDT
`quill-delta` node to Quill Editor, allowing multiple users to edit the same
rich-text document concurrently.

![collab-quill-demo](https://github.com/user-attachments/assets/22bae7b3-d88b-428f-95b0-cc9ee757602b)


## Usage

Installation:

```
npm install json-joy @jsonjoy.com/collaborative-quill-react quill quill-delta react react-dom
```

Usage:

```tsx
import {ModelWithExt, ext} from 'json-joy/lib/json-crdt-extensions';
import {CollaborativeQuill} from '@jsonjoy.com/collaborative-quill-react';

const model = ModelWithExt.create(ext.quill.new('hello'));

const MyComponent = () => {
  return <CollaborativeQuill api={() => model.s.toExt()} />
};
```

The `CollaborativeQuill` component accepts all props from a standard `div` element,
plus the following props:

- `api`: A function that returns the `QuillDeltaApi` instance for the collaborative document.
- `options`: Quill editor options (theme, modules, etc.).
- `readonly`: Whether the editor is read-only.
- `themeCss`: Custom CSS URL for the Quill theme.
- `onEditor`: Callback called with the Quill editor instance.
- `onTextChange`: Callback for text change events.
- `onSelectionChange`: Callback for selection change events.
- `onEditorChange`: Callback for all editor change events.

## Funding

This project is funded through [NGI Zero Core](https://nlnet.nl/core), a fund established by [NLnet](https://nlnet.nl) with financial support from the European Commission's [Next Generation Internet](https://ngi.eu) program. Learn more at the [NLnet project page](https://nlnet.nl/project/JSON-Joy-Peritext).

[<img src="https://nlnet.nl/logo/banner.png" alt="NLnet foundation logo" width="20%" />](https://nlnet.nl)
[<img src="https://nlnet.nl/image/logos/NGI0_tag.svg" alt="NGI Zero Logo" width="20%" />](https://nlnet.nl/core)


