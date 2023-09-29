---
outline: deep
head:
  - - meta
    - property: og:title
      content: getUserOperationHash
  - - meta
    - name: description
      content: Overview of the getUserOperationHash method in aa-core utils
  - - meta
    - property: og:description
      content: Overview of the getUserOperationHash method in aa-core utils
---

# getUserOperationHash

Generates a hash for a UserOperation valid from entrypoint version 0.6 onwards

## Usage

::: code-group

```ts [example.ts]
import { getUserOperationHash } from "@alchemy/aa-core";

const result = getUserOperationHash(
  {
    // ... the UserOperationRequest
  },
  "0xAddress",
  1n
);
// 0xUserOpHash
```

:::

## Returns

### `Hash`

The hash of the user operation

## Paramters

### `request: UserOperationRequest`

The UserOperation to hash

### `entrypointAddress: Address`

The entrypoint address to use for the UserOperation

### `chainId: bigint`

The chainId that this UserOperation will be submitted to

```

```
