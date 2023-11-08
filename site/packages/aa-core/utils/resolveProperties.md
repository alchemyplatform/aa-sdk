---
outline: deep
head:
  - - meta
    - property: og:title
      content: resolveProperties
  - - meta
    - name: description
      content: Overview of the resolveProperties method in aa-core utils
  - - meta
    - property: og:description
      content: Overview of the resolveProperties method in aa-core utils
next:
  text: aa-alchemy
---

# `resolveProperties<T>`

Await all of the properties of a Deferrable object. A Deferrable object is an object that has properties that are either a Promise or a value.

## Usage

::: code-group

```ts [example.ts]
import { resolveProperties } from "@alchemy/aa-core";
const result = await resolveProperties({
  foo: new Promise((resolve) => resolve("foo")),
  bar: "bar",
});
// { foo: "foo", bar: "bar" }
```

:::

## Returns

### `Promise<T>`

The object with all properties resolved (awaited).

## Parameters

### `object: Deferrable<T>`

The object to resolve properties on. A Deferrable object is an object that has properties that are either a Promise or a value
