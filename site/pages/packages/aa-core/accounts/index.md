---
title: SmartContractAccount
description: Overview of SmartContractAccount exported by aa-core
---

# SmartContractAccount

The `SmartContractAccount` interface is an extension of viem's [`CustomAccount`](https://viem.sh/docs/accounts/custom) with additional methods used for Account Abstraction. It is meant to be used in conjunction with a [`SmartAccountClient`](/packages/aa-core/smart-account-client/).

## Custom Smart Contract Accounts

If you have your own smart contract that you would like to interact with, then you can use the `toSmartContractAccount` method to create a `SmartContractAccount` instance.

### Usage

```ts [my-account.ts]
// [!include ~/snippets/aa-core/custom-account.ts]
```

### Returns

#### `SmartContractAccount`

```ts
export type SmartContractAccount<Name extends string = string> =
  LocalAccount<Name> & {
    source: Name;
    getDummySignature: () => Hex | Promise<Hex>;
    encodeExecute: (tx: Tx) => Promise<Hex>;
    encodeBatchExecute: (txs: Tx[]) => Promise<Hex>;
    signUserOperationHash: (uoHash: Hex) => Promise<Hex>;
    signMessageWith6492: (params: { message: SignableMessage }) => Promise<Hex>;
    signTypedDataWith6492: <
      const typedData extends TypedData | Record<string, unknown>,
      primaryType extends keyof typedData | "EIP712Domain" = keyof typedData
    >(
      typedDataDefinition: TypedDataDefinition<typedData, primaryType>
    ) => Promise<Hex>;
    encodeUpgradeToAndCall: (params: UpgradeToAndCallParams) => Promise<Hex>;
    getNonce(): Promise<bigint>;
    getInitCode: () => Promise<Hex>;
    isAccountDeployed: () => Promise<boolean>;
    getFactoryAddress: () => Address;
    getEntryPoint: () => Address;
    getImplementationAddress: () => Promise<NullAddress | Address>;
  };
```
