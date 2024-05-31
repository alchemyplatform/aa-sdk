---
outline: deep
head:
  - - meta
    - property: og:title
      content: defineReadOnly
  - - meta
    - name: description
      content: Overview of the defineReadOnly method in aa-core utils
  - - meta
    - property: og:description
      content: Overview of the defineReadOnly method in aa-core utils
---

# `defineReadOnly<T, K extends keyof T>`

Let's you overwrite a readonly property on a class.

Borrowed from [ethers](https://github.com/ethers-io/ethers.js/blob/v5.7/packages/properties/src.ts/index.ts#L7).

## Usage

::: code-group

```ts [example.ts]
import { defineReadOnly } from "@alchemy/aa-core";

class Test {
  readonly a: number = 1;
  setA(a: number) {
    defineReadOnly(this, "a", a);
  }
}
```

## Parameters

### `object: T`

The object on which to overwrite the readonly property.

### `key: K` where `K extends keyof T`

A key on the object to overwrite.

### `value: T[K]`

The value to overwrite the readonly property with.
