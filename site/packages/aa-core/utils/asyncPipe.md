---
outline: deep
head:
  - - meta
    - property: og:title
      content: asyncPipe
  - - meta
    - name: description
      content: Overview of the asyncPipe method in aa-core utils
  - - meta
    - property: og:description
      content: Overview of the asyncPipe method in aa-core utils
---

# `asyncPipe<T>`

Utility function that allows for piping a series of async functions together that operate on a common type `T`

## Usage

::: code-group

```ts [example.ts]
import { asyncPipe } from "@alchemy/aa-core";

const addOne = async (num: number) => num + 1;
const addTwo = async (num: number) => num + 2;

const result = await asyncPipe(addOne, addTwo)(0);
```

:::

## Returns

### `T`

The result of the last function in the pipe chain

## Parameters

### `fns: Array<(x: T) => Promise<T>>`

The array of functions to pipe together
