---
outline: deep
head:
  - - meta
    - property: og:title
      content: wrapWith6492
  - - meta
    - name: description
      content: Description of the wrapWith6492 utility method
  - - meta
    - property: og:description
      content: Description of the wrapWith6492 utility method
---

# wrapWith6492

Allows you to generate a signature in [EIP-6492](https://eips.ethereum.org/EIPS/eip-6492) format which is useful to verifying signatures of undeployed smart contract accounts.

## Usage

::: code-group

```ts [example.ts]
import { wrapWith6492 } from "@alchemy/aa-core";

const signature = await wrapWith6492({
  factoryAddress: "0xAccountFactoryAddress",
  initCode: "0xinitCode",
  signature: "0xSigntatureToWrapAndVerifyLater",
});
```

:::

## Returns

### Hash

The original signature wrapped in EIP-6492 format

## Paramters

### `SignWith6492Params`

- #### `factoryAddress: Hash`

  The factory address that will be used to deploy the smart contract account that you want to verify the signature of

- #### `initCode: Hex`

  The call data to the factory to create the undeployed account

- #### `signature: Hex`

  The signature that we want to verify
