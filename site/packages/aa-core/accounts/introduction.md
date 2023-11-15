---
outline: deep
head:
  - - meta
    - property: og:title
      content: ISmartContractAccount
  - - meta
    - name: description
      content: Overview of ISmartContractAccount class exported by aa-core accounts
  - - meta
    - property: og:description
      content: Overview of ISmartContractAccount class exported by aa-core accounts
prev:
  text: SmartAccountProvider
---

# ISmartContractAccount

`ISmartContractAccount` defines how you would interact with your Smart Contract Account.

::: details ISmartContractAccount
<<< @/../packages/core/src/account/types.ts
:::

## BaseSmartContractAccount

The `BaseSmartContractAccount` is an abstract class that provides the base implementation the `ISmartContractAccount` interface to provide the ease of creating your own Smart Contract Account. Any class that extends and implements `BaseSmartContractAccount` may also expose additional methods that support its connecting [SmartAccountProvider](/packages/aa-core/provider/introduction).

`BaseSmartContractAccount` contains abstract methods that requires implementation from any class that extends the class.

::: details BaseSmartContractAccount
<<< @/../packages/core/src/account/base.ts
:::

### Required Methods To Implement

- [`getDummySignature`](/packages/aa-core/accounts/required/getDummySignature) -- this method returns a signature that will not `revert` during validation. It does not have to pass validation, just not cause the contract to revert. This is required for gas estimation so that the gas estimate are accurate.
- [`encodeExecute`](/packages/aa-core/accounts/required/encodeExecute) -- this method returns the abi encoded function data for a call to your contract's `execute` method
- [`signMessage`](/packages/aa-core/accounts/required/signMessage) -- this method returns an [EIP-191](https://eips.ethereum.org/EIPS/eip-191) compliant message and is used to sign UO Hashes
- [`getAccountInitCode`](/packages/aa-core/accounts/required/getAccountInitCode) -- this method returns the account init code that will be used to create an account if one does not exist. Usually this is the concatenation of the account's factory address and the abi encoded function data of the account factory's `createAccount` method.

### Optional Methods To Implement

In addition, it provides other optional methods that need to be implemented by the subclass in order to support functionalities such as:

- [`signTypedData`](/packages/aa-core/accounts/optional/signTypedData) -- Signs typed data per [ERC-712](https://eips.ethereum.org/EIPS/eip-712)
- [`signMessageWith6492`](/packages/aa-core/accounts/optional/signMessageWith6492) -- Wraps the result of `signMessage` as per [EIP-6492](https://eips.ethereum.org/EIPS/eip-6492) for signing the message for deployed smart accounts, as well as undeployed accounts
- [`signTypedDataWith6492`](/packages/aa-core/accounts/optional/signTypedDataWith6492) -- Similar to the signMessageWith6492 method above, this method wraps the result of `signTypedData` as per [EIP-6492](https://eips.ethereum.org/EIPS/eip-6492)
- [`encodeBatchExecute`](/packages/aa-core/accounts/optional/encodeBatchExecute) -- If your contract does support batching, encodes a list of transactions into the call data that will be passed to your contract's `batchExecute` method.

**Note**: `signMessageWith6492` and `signTypedDataWith6492` methods are already implemented on `BaseSmartContractAccount`, so any class that extends and implements `BaseSmartContractAccount` may call this method.

## SimpleSmartContractAccount

[SimpleSmartContractAccount](packages/core/src/account/simple.ts) a minimal implementation version of `BaseSmartContractAccount`. It implements the required abstraction methods in `BaseSmartContractAccount`, and additionally implements the optional methods indicated above.

**Note:** While `SimpleSmartContractAccount` fully implements the `ISmartContractAccount` interface for use as your basic smart account, we recommend using our [Light Account](/smart-accounts/accounts/light-account) as it is a simple, yet more secure, and cost-effective smart account implementation.

## Usage

::: code-group

<<< @/snippets/account-core.ts

<<< @/snippets/account-alchemy.ts

<<< @/snippets/account-ethers.ts

:::
