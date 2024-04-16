---
outline: deep
head:
  - - meta
    - property: og:title
      content: useSignTypedData
  - - meta
    - name: description
      content: An overview of the useSignTypedData hook
  - - meta
    - property: og:description
      content: An overview of the useSignTypedData hook
  - - meta
    - name: twitter:title
      content: useSignTypedData
  - - meta
    - name: twitter:description
      content: An overview of the useSignTypedData hook
---

# useSignTypedData

The `useSignTypedData` hook enables signing typed data on behalf of the user's Embedded Account. If the account is not yet deployed onchain, this will use [ERC-6492](/resources/terms.html#erc-6492) to sign the typed data.

::: warning
This requires your user to be logged in. See [`useAuthenticate`](/react/useAuthenticate) for more details.
:::

## Import

```ts
import { useSignTypedData } from "@alchemy/aa-alchemy/react";
```

## Usage

<<< @/snippets/react/useSignTypedData.tsx

## Params

### client

`AlchemySmartAccountClient | undefined`
A `AlchemySmartAccountClient` with methods to interact with an Alchemy smart account.

<!--@include: ./BaseHookMutationArgs.md-->

## Return Type

```ts
import { type UseSignTypedDataResult } from "@alchemy/aa-alchemy/react";
```

Returns an object containing the following state.

### signMessage

`UseMutateFunction`
A React query mutation function to sign typed data. It returns a `Hex` representation of the signed typed data.

### signMessageAsync

`UseMutateAsyncFunction`
A React query async mutation function to sign typed data. Via an awaitable promise, it returns a `Hex` representation of the signed typed data.

### signedMessage

`Hex | undefined`
A flag that determines whether the account recovery details were successfully exported and now viewable in the application.

### isSigningMessage

`boolean`
A flag that determines whether the mutation is still running or not.

### error

`Error | null`
A field that relays any errors from the mutation. It is null if there is no error.
