# @jsonjoy.com/codegen

A no-dependencies, low-level, high-performance JIT code generation package for
JavaScript. This package contains utilities for generating optimized JavaScript
code at runtime. It enables creating high-performance functions by generating
code dynamically based on schemas, templates, or runtime data.

## Features

- **Zero dependencies** - Lightweight and fast to install
- **High performance** - Generates optimized JavaScript functions at runtime
- **Type safe** - Full TypeScript support with comprehensive type definitions
- **Flexible** - Supports various code generation patterns and techniques
- **Production ready** - Battle-tested and optimized for real-world usage

## Use Cases

JIT (Just-In-Time) code generation can provide significant performance improvements
when you have advance knowledge of the data structure or execution pattern.

Some examples:

- **Deep equality comparison function**: When one object is known in advance, we can
  generate an optimized function that efficiently compares against a single object.
  This technique is implemented in the `json-equal` library.

- **JSON Patch execution**: When the JSON Patch operations are known beforehand, we can
  generate an optimized function that applies the patch in the most efficient way.
  This approach is used in the `json-patch` library.

- **Schema-based validation**: Given a `json-type` schema of a JSON object, it's possible
  to generate highly optimized functions for validation and serialization that avoid
  generic overhead and execute significantly faster than traditional approaches.

Other:

- Optimized validation and serialization functions
- Custom function generation based on runtime data
- Performance-critical code that benefits from JIT compilation


## Installation

```bash
npm install @jsonjoy.com/codegen
```

## Quick Start

```typescript
import { Codegen } from '@jsonjoy.com/codegen';

const codegen = new Codegen();
// Add your code generation logic here
const optimizedFunction = codegen.compile();
```

## License

Apache-2.0
