---
outline: deep
head:
  - - meta
    - property: og:title
      content: SmartContractAccount
  - - meta
    - name: description
      content: Overview of SmartContractAccount exported by aa-core
  - - meta
    - property: og:description
      content: Overview of SmartContractAccount exported by aa-core
prev:
  text: SmartAccountClient
---

# SmartContractAccount

The `SmartContractAccount` interface is an extension of viem's [`CustomAccount`](https://viem.sh/docs/accounts/custom) with additional methods used for Account Abstraction. It is meant to be used in conjunction with a [`SmartAccountClient`](/packages/aa-core/smart-account-client/).

## Custom Smart Contract Accounts

If you have your own smart contract that you would like to interact with, then you can use the `toSmartContractAccount` method to create a `SmartContractAccount` instance.

### Usage

```ts
import {
  getVersion060EntryPoint,
  toSmartContractAccount,
} from "@alchemy/aa-core";
import { sepolia } from "viem/chains";

const myAccount = await toSmartContractAccount({
  /// REQUIRED PARAMS ///
  source: "MyAccount",
  transport: http("RPC_URL"),
  chain: sepolia,
  // The EntryPointDef that your account is compatible with
  entryPoint: getVersion060EntryPoint(sepolia),
  // This should return a concatenation of your `factoryAddress` and the `callData` for your factory's create account method
  getAccountInitCode: () => "0x{factoryAddress}{callData}",
  // an invalid signature that doesn't cause your account to revert during validation
  getDummySignature: () => "0x1234...",
  // given a UO in the form of {target, data, value} should output the calldata for calling your contract's execution method
  encodeExecute: (uo)=> "...."
  signMessage: ({message}: SignableMessage) => "0x...",
  signTypedData: (typedData) => "0x000",

  /// OPTIONAL PARAMS ///
  // if you already know your account's address, pass that in here to avoid generating a new counterfactual
  accountAddress?: Address,
  // if your account supports batching, this should take an array of UOs and return the calldata for calling your contract's batchExecute method
  encodeBatchExecute: (uos) => "0x...",
  // if your contract expects a different signing scheme than the default signMessage scheme, you can override that here
  signUserOperationHash: (hash) => "0x...",
  // allows you to define the calldata for upgrading your account
  encodeUpgradeToAndCall: (params) => "0x...",
});
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
    getEntrypoint: () => Address;
    getImplementationAddress: () => Promise<"0x0" | Address>;
  };
```
