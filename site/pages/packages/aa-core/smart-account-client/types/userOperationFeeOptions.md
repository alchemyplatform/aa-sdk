---
title: UserOperationFeeOptions
description: Overview of the UserOperationFeeOptions type in aa-core types
---

# UserOperationFeeOptions

Fee options object type used by the [`SmartAccountClient`](/packages/aa-core/smart-account-client/) during the gas fee calculation middlewares when constructing the user operation to send.

For example, if the below example `UserOperationFeeOptions` is set on the client upon initialization, the `maxPriorityFeePerGas` field on the user operation will be set as the max value between the 50% buffered `maxPriorityFeePerGas` estimate and the min `maxPriorityFeePerGas` value specified here, `100_000_000n`.

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

```ts
const chain = polygonMumbai;
const signer: SmartAccountSigner = LocalAccountSigner.mnemonicToAccountSigner(
  "YOUR_OWNER_MNEMONIC"
);
const rpcTransport = http("https://polygon-mumbai.g.alchemy.com/v2/demo");

const userOperationFeeOptions: UserOperationFeeOptions = {
  maxPriorityFeePerGas: {
    min: 100_000_000n,
    multiplier: 1.5,
  },
};

export const smartAccountClient = createSmartAccountClient({
  transport: rpcTransport,
  chain,
  account: await createMultiOwnerModularAccount({
    transport: rpcTransport,
    chain,
    signer,
  }),
  opts: {
    feeOptions: userOperationFeeOptions,
  },
});
```
