---
outline: deep
head:
  - - meta
    - property: og:title
      content: useSignMessage
  - - meta
    - name: description
      content: An overview of the useSignMessage hook
  - - meta
    - property: og:description
      content: An overview of the useSignMessage hook
  - - meta
    - name: twitter:title
      content: useSignMessage
  - - meta
    - name: twitter:description
      content: An overview of the useSignMessage hook
---

# useSignMessage

The `useSignMessage` hook enables signing a message on behalf of the user's Embedded Account. If the account is not yet deployed onchain, this will use [ERC-6492](/resources/terms.html#erc-6492) to sign the message.

## Import

```ts
import { useSignMessage } from "@alchemy/aa-alchemy/react";
```

## Usage

<<< @/snippets/react/useSignMessage.tsx

## Params

### client

`AlchemySmartAccountClient | undefined`
A `AlchemySmartAccountClient` with methods to interact with an Alchemy smart account.

<!--@include: ./BaseHookMutationArgs.md-->

## Return Type

```ts
import { type UseSignMessageResult } from "@alchemy/aa-alchemy/react";
```

Returns an object containing the following state.

### signMessage

`UseMutateFunction`
A React query mutation function to sign a message. It returns a `Hex` representation of the signed message.

### signMessageAsync

`UseMutateAsyncFunction`
A React query async mutation function to sign a message. Via an awaitable promise, it returns a `Hex` representation of the signed message.

### signedMessage

`Hex | undefined`
A flag that determines whether the account recovery details were successfully exported and now viewable in the application.

### isSigningMessage

`boolean`
A flag that determines whether the mutation is still running or not.

### error

`Error | null`
A field that relays any errors from the mutation. It is null if there is no error.
