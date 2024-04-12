---
outline: deep
head:
  - - meta
    - property: og:title
      content: useAddPasskey
  - - meta
    - name: description
      content: An overview of the useAddPasskey hook
  - - meta
    - property: og:description
      content: An overview of the useAddPasskey hook
  - - meta
    - name: twitter:title
      content: useAddPasskey
  - - meta
    - name: twitter:description
      content: An overview of the useAddPasskey hook
---

# useAddPasskey

The `useAddPasskey` hook adds a new passkey to a user's Embedded Account.

## Import

```ts
import { useAddPasskey } from "@alchemy/aa-alchemy/react";
```

## Usage

<<< @/snippets/react/useAddPasskey.tsx

## Return Type

```ts
import { type useAddPasskeyResult } from "@alchemy/aa-alchemy/react";
```

Returns a `string[]` list of all passkey authenticatorIds, including the newly added one.
