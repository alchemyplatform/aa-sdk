---
outline: deep
head:
  - - meta
    - property: og:title
      content: sendRawUserOperation
  - - meta
    - name: description
      content: Overview of the sendRawUserOperation action available on the BundlerClient
  - - meta
    - property: og:description
      content: Overview of the sendRawUserOperation action available on the BundlerClient
prev:
  text: Public ERC-4337 Client
---

# sendRawUserOperation

Calls `eth_sendUserOperation` and returns the hash of the sent `UserOperation` (UO).

## Usage

::: code-group

```ts [example.ts]
import { client } from "./client";

const hash = await client.sendRawUserOperation(
  {
    // ... user operation
  },
  "0xEntryPointAddress"
);
```

<<< @/snippets/bundlerClient.ts
:::

## Returns

### `Promise<Hash>`

the hash of the sent UO

## Parameters

### `request: UserOperationRequest`

The user operation to send

### `entryPointAddress: Address`

The address of the entry point to send the user operation to
