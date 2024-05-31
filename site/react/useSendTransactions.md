---
outline: deep
head:
  - - meta
    - property: og:title
      content: useSendTransactions
  - - meta
    - name: description
      content: An overview of the useSendTransactions hook
  - - meta
    - property: og:description
      content: An overview of the useSendTransactions hook
  - - meta
    - name: twitter:title
      content: useSendTransactions
  - - meta
    - name: twitter:description
      content: An overview of the useSendTransactions hook
---

# useSendTransactions

The `useSendTransactions` hook enables sending a set of transactions as a UserOperation on behalf of the user's Embedded Account.

::: warning
This hook is deprecated in favor of [`useSendUserOperation`](/react/useSendUserOperation).

This requires your user to be logged in. See [`useAuthenticate`](/react/useAuthenticate) for more details.
:::

## Import

```ts
import { useSendTransactions } from "@alchemy/aa-alchemy/react";
```

## Usage

<<< @/snippets/react/useSendTransactions.tsx

## Params

### client

`AlchemySmartAccountClient | undefined`
A `AlchemySmartAccountClient` with methods to interact with an Alchemy smart account.

### ...mutationArgs

<!--@include: ./BaseHookMutationArgs.md-->

## Return Type

```ts
import { type UseSendTransactions } from "@alchemy/aa-alchemy/react";
```

Returns an object containing the following state.

### sendTransactions

`UseMutateFunction`
A React query mutation function to send a Transactions as a UserOperation. It returns a `SendTransactionsResult` object.

::: details SendTransactionsResult
<<< @/../packages/core/src/client/types.ts#SendTransactionsResult
:::

It takes in `SendTransactionsParameters` which has the following type:

::: details SendTransactionsParameters
<<< @/../packages/core/src/actions/smartAccount/types.ts#SendTransactionsParameters
:::

### sendTransactionsAsync

`UseMutateAsyncFunction`
A React query async mutation function to send a Transactions as a UserOperation. Via an awaitable promise, it returns a `SendTransactionsResult` object shown above.

### sendTransactionsResult

An transaction hash if the mutation has run successfully, `undefined` otherwise.

### isSendingTransactions

`boolean`
A flag that determines whether the mutation is still running or not.

### error

`Error | null`
A field that relays any errors from the mutation. It is null if there is no error.
