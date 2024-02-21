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

If you have your own smart contract that you'd like to interact with, then you can use the `toSmartContractAccount` method to create a `SmartContractAccount` instance.

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
export type SmartContractAccount<
  Name extends string = string,
  TUO = UserOperationRequest
> = LocalAccount<Name> & {
  source: Name;

  /**
   * This is useful for estimating gas costs. It should return a signature that doesn't cause the account to revert
   * when validation is run during estimation.
   *
   * @returns a dummy signature that doesn't cause the account to revert during estimation
   */
  getDummySignature: () => Hex;

  /**
   * Encodes a call to the account's execute function.
   *
   * @param target - the address receiving the call data
   * @param value - optionally the amount of native token to send
   * @param data - the call data or "0x" if empty
   */
  encodeExecute: (tx: AccountOp) => Promise<Hex>;

  /**
   * Encodes a batch of transactions to the account's batch execute function.
   * NOTE: not all accounts support batching.
   * @param txs - An Array of objects containing the target, value, and data for each transaction
   * @returns the encoded callData for a UserOperation
   */
  encodeBatchExecute: (txs: AccountOp[]) => Promise<Hex>;

  /**
   * If your account handles 1271 signatures of personal_sign differently
   * than it does UserOperations, you can implement two different approaches to signing
   *
   * @param uoHash -- The hash of the UserOperation to sign
   * @returns the signature of the UserOperation
   */
  signUserOperationHash: (uoHash: Hex) => Promise<Hex>;

  /**
   * If the account is not deployed, it will sign the message and then wrap it in 6492 format
   *
   * @param msg - the message to sign
   * @returns ths signature wrapped in 6492 format
   */
  signMessageWith6492: (params: { message: SignableMessage }) => Promise<Hex>;

  /**
   * If the account is not deployed, it will sign the typed data blob and then wrap it in 6492 format
   *
   * @param params - {@link SignTypedDataParams}
   * @returns the signed hash for the params passed in wrapped in 6492 format
   */
  signTypedDataWith6492: <
    const typedData extends TypedData | Record<string, unknown>,
    primaryType extends keyof typedData | "EIP712Domain" = keyof typedData
  >(
    typedDataDefinition: TypedDataDefinition<typedData, primaryType>
  ) => Promise<Hex>;

  /**
   * If your contract supports UUPS, you can implement this method which can be
   * used to upgrade the implementation of the account.
   *
   * @param params -- the UpgradeToAndCallParams for the account to upgrade to
   */
  encodeUpgradeToAndCall: (params: UpgradeToAndCallParams) => Promise<Hex>;

  /**
   * The optional nonceKey param is used when calling `entryPoint.getNonce`
   * It is useful when you want to use parallel nonces for user operations
   *
   * NOTE: not all bundlers fully support this feature and it could be that your bundler will still only include
   * one user operation for your account in a bundle
   *
   * @param nonceKey -- the nonce key to use parallel nonces for user operations
   * @returns the nonce of the account from entry point contract
   */
  getNonce(nonceKey?: bigint): Promise<bigint>;

  /**
   * @returns the init code for the account
   */
  getInitCode: () => Promise<Hex>;

  /**
   * @returns the boolean whether the account has been created on-chain
   */
  isAccountDeployed: () => Promise<boolean>;

  /**
   * @returns the address of the factory contract for the smart account
   */
  getFactoryAddress: () => Address;

  /**
   * @returns the entry point contract def for the smart account
   */
  getEntryPoint: () => EntryPointDef<TUO>;

  /**
   * @returns the implementation contract address of the smart account
   */
  getImplementationAddress: () => Promise<"0x0" | Address>;
};
```
