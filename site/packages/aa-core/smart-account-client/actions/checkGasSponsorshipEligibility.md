---
outline: deep
head:
  - - meta
    - property: og:title
      content: checkGasSponsorshipEligibility
  - - meta
    - name: description
      content: Overview of the checkGasSponsorshipEligibility method on SmartAccountClient
  - - meta
    - property: og:description
      content: Overview of the checkGasSponsorshipEligibility method on SmartAccountClient
---

# checkGasSponsorshipEligibility

This function verifies the eligibility of the connected account for gas sponsorship concerning the upcoming `UserOperation` (UO) that is intended to be sent.

Internally, this method invokes [`buildUserOperation`](./buildUserOperation.md), which navigates through the middleware pipeline, including the `PaymasterMiddleware`. Its purpose is to construct the UO struct meant for transmission to the bundler. Following the construction of the UO struct, this function verifies if the resulting structure contains a non-empty `paymasterAndData` field.

You can utilize this method before sending the user operation to confirm its eligibility for gas sponsorship. Depending on the outcome, it allows you to tailor the user experience accordingly, based on eligibility.

For a deeper understanding of how to employ this method to provide varied user experiences contingent on gas sponsorship eligibility, please refer to the guide [How to handle User Operations not eligible for gas sponsorship](/using-smart-accounts/sponsoring-gas/checking-eligibility.md).

## Usage

::: code-group

```ts [example.ts]
import { smartAccountClient } from "./smartAccountClient";
// [!code focus:99]
const eligible = await smartAccountClient.checkGasSponsorshipEligibility({
  uo: {
    data: "0xCalldata",
    target: "0xTarget",
    value: 0n,
  },
});

console.log(
  `User Operation is ${
    eligible ? "eligible" : "ineligible"
  } for gas sponsorship.`
);
```

<<< @/snippets/aa-core/smartAccountClient.ts
:::

## Returns

### `Promise<boolean>`

A Promise containing the boolean value indicating whether the UO to be sent is eligible for gas sponsorship or not.

## Parameters

### `SendUserOperationParameters<TAccount extends SmartContractAccount | undefined = SmartContractAccount | undefined>`

- `uo:` [`UserOperationCallData`](/resources/types#UserOperationCallData) | [`BatchUserOperationCallData`](/resources/types#BatchUserOperationCallData)

  ::: details UserOperationCallData
  <<< @/../packages/core/src/types.ts#UserOperationCallData
  :::

  - `target: Address` - the target of the call (equivalent to `to` in a transaction)
  - `data: Hex` - can be either `0x` or a call data string
  - `value?: bigint` - optionally, set the value in wei you want to send to the target

- `overrides?:` [`UserOperationOverrides`](/resources/types#UserOperationOverrides)

Optional parameter where you can specify override values for `maxFeePerGas`, `maxPriorityFeePerGas`, `callGasLimit`, `preVerificationGas`, `verificationGasLimit`, `paymasterAndData`, or `nonceKey` for the user operation request

- `account?: TAccount extends SmartContractAccount | undefined`

When using this action, if the `SmartContractAccount` has not been connected to the `SmartAccountClient` (e.g. `SmartAccountClient` not instantiated with your `SmartContractAccount` during [`createSmartAccountClient`](/packages/aa-core/smart-account-client/)). You can check if the account is connected to the client by checking the `account` field of `SmartAccountClient`. If the account is not connected, you can specify the `SmartContractAccount` instance to use for the function call.
