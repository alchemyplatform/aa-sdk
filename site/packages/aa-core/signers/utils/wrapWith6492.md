---
outline: deep
head:
  - - meta
    - property: og:title
      content: wrapSignatureWith6492
  - - meta
    - name: description
      content: Description of the wrapSignatureWith6492 utility method
  - - meta
    - property: og:description
      content: Description of the wrapSignatureWith6492 utility method
---

# wrapSignatureWith6492

Allows you to generate a signature in [ERC-6492](https://eips.ethereum.org/EIPS/eip-6492) format which is useful to verifying signatures of undeployed smart contract accounts.

## Usage

::: code-group

```ts [example.ts]
import { wrapSignatureWith6492 } from "@alchemy/aa-core";

const signature = await wrapSignatureWith6492({
  factoryAddress: "0xAccountFactoryAddress",
  factoryCallData: "0xfactoryCallData",
  signature: "0xSigntatureToWrapAndVerifyLater",
});
```

:::

## Returns

### Hash

The original signature wrapped in ERC-6492 format

## Paramters

### `SignWith6492Params`

- #### `factoryAddress: Hash`

  The factory address that will be used to deploy the smart contract account that you want to verify the signature of

- #### `factoryCallData: Hex`

  The call data to the factory to create the undeployed account

- #### `signature: Hex`

  The signature that we want to verify
