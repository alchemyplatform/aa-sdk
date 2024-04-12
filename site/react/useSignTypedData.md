---
outline: deep
head:
  - - meta
    - property: og:title
      content: useSignTypedData
  - - meta
    - name: description
      content: An overview of the useSignTypedData hook
  - - meta
    - property: og:description
      content: An overview of the useSignTypedData hook
  - - meta
    - name: twitter:title
      content: useSignTypedData
  - - meta
    - name: twitter:description
      content: An overview of the useSignTypedData hook
---

# useSignTypedData

The `useSignTypedData` hook enables signing typed data on behalf of the user's Embedded Account.

## Import

```ts
import { useSignTypedData } from "@alchemy/aa-alchemy/react";
```

## Usage

<<< @/snippets/react/useSignTypedData.tsx

## Return Type

```ts
import { type useSignTypedDataResult } from "@alchemy/aa-alchemy/react";
```

Returns a `Hex` representation of the signed typed data.
