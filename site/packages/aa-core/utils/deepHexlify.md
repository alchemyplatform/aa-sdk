---
outline: deep
head:
  - - meta
    - property: og:title
      content: deepHexlify
  - - meta
    - name: description
      content: Overview of the deepHexlify method in aa-core utils
  - - meta
    - property: og:description
      content: Overview of the deepHexlify method in aa-core utils
---

# deepHexlify

Utility function that recursively converts all values in an object to hex strings (where applicable).

## Usage

::: code-group

```ts [example.ts]
import { deepHexlify } from "@alchemy/aa-core";

const obj = {
    aBigInt: 1n,
    anInt: 1,
    aString: "1",
    anArray: [1n, 1, "1"],
    anObject: {
        aBigInt: 1n,
        anInt: 1,
        aString: "1",
        anArray: [1n, 1, "1"],
    },
};

const result = deepHexlify(obj);
/**
 * {
 *  aBigInt: "0x1",
 *  anInt: "0x1,
 *  aString: "1",
 *  anArray: ["0x1", "0x1", "1"],
 *  anObject: {
 *   aBigInt: "0x1",
 *   anInt: "0x1,
 *   aString: "1",
 *   anArray: ["0x1", "0x1", "1"],
 *  }
 * }
 * /
```

## Returns

The object with all convertible values converted to hex strings.

## Params

### `obj: any`

The object to convert to hex strings.
