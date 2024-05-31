---
outline: deep
head:
  - - meta
    - property: og:title
      content: useChain
  - - meta
    - name: description
      content: An overview of the useChain hook
  - - meta
    - property: og:description
      content: An overview of the useChain hook
  - - meta
    - name: twitter:title
      content: useChain
  - - meta
    - name: twitter:description
      content: An overview of the useChain hook
---

# useChain

The `useChain` hook is used to get the currently connected chain as well as set the current chain.

## Import

```ts
import { useChain } from "@alchemy/aa-alchemy/react";
```

## Usage

<<< @/snippets/react/useChain.tsx

## Return Type

```ts
import { type UseChainResult } from "@alchemy/aa-alchemy/react";
```

### chain

The currently connected chain.

### setChain

A function that allows you to set the current chain. The chain **must** be included in your config's `connections` array.
