---
outline: deep
head:
  - - meta
    - property: og:title
      content: useSignMessage
  - - meta
    - name: description
      content: An overview of the useSignMessage hook
  - - meta
    - property: og:description
      content: An overview of the useSignMessage hook
  - - meta
    - name: twitter:title
      content: useSignMessage
  - - meta
    - name: twitter:description
      content: An overview of the useSignMessage hook
---

# useSignMessage

The `useSignMessage` hook enables signing a message on behalf of the user's Embedded Account.

## Import

```ts
import { useSignMessage } from "@alchemy/aa-alchemy/react";
```

## Usage

<<< @/snippets/react/useSignMessage.tsx

## Return Type

```ts
import { type useSignMessageResult } from "@alchemy/aa-alchemy/react";
```

Returns a `Hex` representation of the signed message.
