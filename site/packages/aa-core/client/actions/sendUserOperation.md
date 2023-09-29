---
outline: deep
head:
  - - meta
    - property: og:title
      content: sendUserOperation
  - - meta
    - name: description
      content: Overview of the sendUserOperation action available on the PublicErc4337Client
  - - meta
    - property: og:description
      content: Overview of the sendUserOperation action available on the PublicErc4337Client
---

# sendUserOperation

Calls `eth_sendUserOperation` and returns the hash of the sent UserOperation.

## Usage

::: code-group

```ts [example.ts]
import { client } from "./client";

const hash = await client.sendUserOperation(
  {
    // ... user operation
  },
  "0xEntryPointAddress"
);
```

<<< @/snippets/client.ts
:::

## Returns

### `Promise<Hash>`

the hash of the sent UserOperation

## Parameters

### `request: UserOperationRequest`

The user operation to send

### `entryPointAddress: Address`

The address of the entry point to send the user operation to
