---
outline: deep
head:
  - - meta
    - property: og:title
      content: Using Your Own Smart Account
  - - meta
    - name: description
      content: Follow this guide to use any smart account implementation you want with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
  - - meta
    - property: og:description
      content: Follow this guide to use any smart account implementation you want with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
  - - meta
    - name: twitter:title
      content: Using Your Own Smart Account
  - - meta
    - name: twitter:description
      content: Follow this guide to use any smart account implementation you want with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
next:
  text: Choosing a Signer
---

# Using Your Own Smart Account

You are not limited to the accounts defined in `@alchemy/aa-accounts`. The `SmartAccountProvider` can be used with any Smart Contract Account because it only relies on the [`ISmartContractAccount`](https://github.com/alchemyplatform/aa-sdk/blob/main/packages/core/src/account/types.ts#L8) interface. This means you can use your own Smart Contract Account implementation with Account Kit.

## Implementing `ISmartContractAccount`

Let's take a look at [`BaseSmartContractAccount`](https://github.com/alchemyplatform/aa-sdk/blob/main/packages/core/src/account/base.ts) and walk through an example of implementing an interface to work with your own Smart Contract Account.

### 1. Extend `BaseSmartContractAccount`

In `aa-core`, we provide an abstract class that handles most of the `ISmartContractAccount` interface, making this very simple!

The `BaseSmartContractAccount` class leaves four methods as abstract for you to implement in your own class:

::: details Click to expand
<<< @/../packages/core/src/account/base.ts#abstract-methods
:::

### 2. [Optional] Implement Additional methods from `BaseSmartContractAccount`

The `BaseSmartContractAccount` class also exposes some additional implementations that by defaul will throw an error if not implemented. You can override these methods to provide your own implementation:

::: details Click to expand
<<< @/../packages/core/src/account/base.ts#optional-methods
:::

### 3. [Optional] Contribute to `aa-accounts`!

See ["Contributing to `aa-accounts`"](/packages/aa-accounts/contributing) for more information on how to contribute your own Smart Contract Account implementation to `aa-accounts`.

## `LightSmartContractAccount` as an Example

We have built an extension of the eth-infinitism `SimpleAccount` called [LightAccount.sol](https://github.com/alchemyplatform/light-account/blob/main/src/LightAccount.sol). You can learn more about Light Account in the [Light Account documentation](/smart-accounts/accounts/light-account).

We provide an implementation of `ISmartContractAccount` that works with `LightAccount.sol` which can be used as an example of how to implement your own Smart Contract Account:
::: details LightSmartContractAccount
<<< @/../packages/accounts/src/light-account/account.ts
:::

## The `ISmartContractAccount` Interface

For your reference, this is the definition of the `ISmartContractAccount` interface as pulled from the source code:

::: details ISmartContractAccount
<<< @/../packages/core/src/account/types.ts
:::
