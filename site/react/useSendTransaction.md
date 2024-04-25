---
outline: deep
head:
  - - meta
    - property: og:title
      content: useSendTransaction
  - - meta
    - name: description
      content: An overview of the useSendTransaction hook
  - - meta
    - property: og:description
      content: An overview of the useSendTransaction hook
  - - meta
    - name: twitter:title
      content: useSendTransaction
  - - meta
    - name: twitter:description
      content: An overview of the useSendTransaction hook
---

# useSendTransaction

The `useSendTransaction` hook enables sending a transaction as a UserOperation on behalf of the user's Embedded Account.

::: warning
This requires your user to be logged in. See [`useAuthenticate`](/react/useAuthenticate) for more details.
:::

## Import

```ts
import { useSendTransaction } from "@alchemy/aa-alchemy/react";
```

## Usage

<<< @/snippets/react/useSendTransaction.tsx

## Params

### client

`AlchemySmartAccountClient | undefined`
A `AlchemySmartAccountClient` with methods to interact with an Alchemy smart account.

### ...mutationArgs

<!--@include: ./BaseHookMutationArgs.md-->

## Return Type

```ts
import { type UseSendTransaction } from "@alchemy/aa-alchemy/react";
```

Returns an object containing the following state.

### sendTransaction

`UseMutateFunction`
A React query mutation function to send a transaction as a UserOperation. It returns a `SendTransactionResult` object.

::: details SendTransactionResult
<<< @/../packages/core/src/client/types.ts#SendTransactionResult
:::

It takes in `SendTransactionParameters` which has [this type](https://viem.sh/docs/actions/wallet/sendTransaction.html#parameters) from `viem`.

### sendTransactionAsync

`UseMutateAsyncFunction`
A React query async mutation function to send a transaction as a UserOperation. Via an awaitable promise, it returns a `SendTransactionResult` object shown above.

### sendTransactionResult

An transaction hash if the mutation has run successfully, `undefined` otherwise.

### isSendingTransaction

`boolean`
A flag that determines whether the mutation is still running or not.

### error

`Error | null`
A field that relays any errors from the mutation. It is null if there is no error.
