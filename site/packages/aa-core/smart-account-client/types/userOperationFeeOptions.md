---
outline: deep
head:
  - - meta
    - property: og:title
      content: UserOperationFeeOptions
  - - meta
    - name: description
      content: Overview of the UserOperationFeeOptions type in aa-core types
  - - meta
    - property: og:description
      content: Overview of the UserOperationFeeOptions type in aa-core types
---

# UserOperationFeeOptions

Fee options object type used by the [`SmartAccountClient`](/packages/aa-core/smart-account-client/index.md) during the gas fee calculation middlewares when constructing the user operation to send.

For example, if the below example `UserOperationFeeOptions` is set on the provider upon initialization, the `maxPriorityFeePerGas` field on the user operation will be set as the max value between the 50% buffered `maxPriorityFeePerGas` estimate and the the min `maxPriorityFeePerGas` value specified here, `100_000_000n`.

```ts
type UserOperationFeeOptions {
  maxFeePerGas?: UserOperationFeeOptionsField,
  maxPriorityFeePerGas?: UserOperationFeeOptionsField,
  callGasLimit?: UserOperationFeeOptionsField,
  verificationGasLimit?: UserOperationFeeOptionsField,
  preVerificationGas?: UserOperationFeeOptionsField,
}
```

## Usage

::: code-group

```ts [example.ts]
import { sepolia } from "@alchemy/aa-core";
import { type Chain } from "viem";

import {
  type UserOperationFeeOptions,
  type SmartAccountClient,
} from "@alchemy/aa-core";

import { API_KEY } from "./constants.js";

const userOperationFeeOptions: UserOperationFeeOptions = {
  maxPriorityFeePerGas: {
    min: 100_000_000n,
    percentage: 50,
  },
};

const provider = const provider = new SmartAccountClient({
  rpcProvider: `${sepolia.rpcUrls.alchemy.http[0]}/${API_KEY}`,
  chain: sepolia,
  opts: {
    feeOptions: userOperationFeeOptions,
  },
});
```

:::
