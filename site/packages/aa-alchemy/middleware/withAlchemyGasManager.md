---
outline: deep
head:
  - - meta
    - property: og:title
      content: Middleware • withAlchemyGasManager
  - - meta
    - name: description
      content: Overview of the withAlchemyGasManager method in aa-alchemy
  - - meta
    - property: og:description
      content: Overview of the withAlchemyGasManager method in aa-alchemy
---

# withAlchemyGasManager

`withAlchemyGasManager` is a middleware method you can use to easily leverage the Alchemy Gas Manager (an [EIP-4337](https://eips.ethereum.org/EIPS/eip-4337) Paymaster) for sponsoring user operations.

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";
import { withAlchemyGasManager } from "@alchemy/aa-alchemy";

// use Alchemy Gas Manager to sponsorship transactions
const providerWithGasManager = withAlchemyGasManager(
  provider,
  {
    policyId: PAYMASTER_POLICY_ID,
  },
  true // If true, uses `alchemy_requestGasAndPaymasterAndData`, otherwise uses `alchemy_requestPaymasterAndData`
);
```

<<< @/snippets/provider.ts
:::

## Returns

### `AlchemyProvider`

A new instance of an `AlchemyProvider` with the same attributes as the input, now with middleware for accessing the Alchemy Gas Manager to sponsor UserOperations.

## Parameters

### `provider: AlchemyProvider` -- an `AlchemyProvider` instance

### `AlchemyGasManagerConfig: AlchemyGasManagerConfig`

- `policyId: string` -- the Alchemy Gas Manager policy ID

### `estimateGas: boolean` -- a flag to additionally estimate gas as part of
