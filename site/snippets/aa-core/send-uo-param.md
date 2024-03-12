```ts
export type SendUserOperationParameters<
  TAccount extends SmartContractAccount | undefined,
> = {
  uo: UserOperationCallData | BatchUserOperationCallData;
  overrides?: UserOperationOverrides;
} & GetAccountParameter<TAccount>;
```

## Parameters

### [`SendUserOperationParameters`](/resources/types#SendUserOperationParameters)

- `uo:` [`UserOperationCallData`](/resources/types#SendUserOperationParameters) | [`BatchUserOperationCallData`](/resources/types#SendUserOperationParameters)

  - `target: Address` - the target of the call (equivalent to `to` in a transaction)
  - `data: Hex` - can be either `0x` or a call data string
  - `value?: bigint` - optionally, set the value in wei you want to send to the target

- `overrides?:` [`UserOperationOverrides`](/resources/types#UserOperationOverrides)

Optional parameter where you can specify override values for `maxFeePerGas`, `maxPriorityFeePerGas`, `callGasLimit`, `preVerificationGas`, `verificationGasLimit`, `paymasterAndData`, or `nonceKey` for the user operation request

- `account?: TAccount extends SmartContractAccount | undefined`

When using this action, if the `SmartContractAccount` has not been connected to the `SmartAccountClient` (e.g. `SmartAccountClient` not instantiated with your `SmartContractAccount` during [`createSmartAccountClient`](/packages/aa-core/smart-account-client/)). You can check if the account is connected to the client by checking the `account` field of `SmartAccountClient`. If the account is not connected, you can specify the `SmartContractAccount` instance to use for the function call.
