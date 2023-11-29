---
outline: deep
head:
  - - meta
    - property: og:title
      content: connect
  - - meta
    - name: description
      content: Overview of the connect method on SmartAccountProvider
  - - meta
    - property: og:description
      content: Overview of the connect method on SmartAccountProvider
---

# connect

Sets the current account to the smart account returned by the given function.

The function parameter is called with the public rpc client that is used by this provider so the account can make RPC calls.

This function emits `connect` and `accountsChanged` events to notify listeners about the connection.

## Usage

::: code-group

<<< @/snippets/provider.ts

:::

## Returns

### SmartAccountProvider

The provider with the account connected

## Parameters

### `fn: (provider: PublicErc4337Client) => BaseSmartContractAccount`

The function that given public rpc client, returns a smart account
