---
outline: deep
head:
  - - meta
    - property: og:title
      content: useSendUserOperation
  - - meta
    - name: description
      content: An overview of the useSendUserOperation hook
  - - meta
    - property: og:description
      content: An overview of the useSendUserOperation hook
  - - meta
    - name: twitter:title
      content: useSendUserOperation
  - - meta
    - name: twitter:description
      content: An overview of the useSendUserOperation hook
---

# useSendUserOperation

The `useSendUserOperation` hook enables sending UserOperations on behalf of the user's Embedded Account.

::: warning
This requires your user to be logged in. See [`useAuthenticate`](/react/useAuthenticate) for more details.
:::

## Import

```ts
import { useSendUserOperation } from "@alchemy/aa-alchemy/react";
```

## Usage

<<< @/snippets/react/useSendUserOperation.tsx

## Params

### client

`AlchemySmartAccountClient | undefined`
A `AlchemySmartAccountClient` with methods to interact with an Alchemy smart account.

### ...mutationArgs

<!--@include: ./BaseHookMutationArgs.md-->

## Return Type

```ts
import { type UseSendUserOperation } from "@alchemy/aa-alchemy/react";
```

Returns an object containing the following state.

### sendUserOperation

`UseMutateFunction`
A React query mutation function to send a UserOperation. It returns a `SendUserOperationResult` object.

::: details SendUserOperationResult
<<< @/../packages/core/src/client/types.ts#SendUserOperationResult
:::

It takes in `SendUserOperationParameters` which has the following type:

::: details SendUserOperationParameters
<<< @/../packages/core/src/actions/smartAccount/types.ts#SendUserOperationParameters
:::

### sendUserOperationAsync

`UseMutateAsyncFunction`
A React query async mutation function to send a UserOperation. Via an awaitable promise, it returns a `SendUserOperationResult` object shown above.

### sendUserOperationResult

An object of the shown above `SendUserOperationResult` type if the mutation has run successfully, `undefined` otherwise:

### isSendingUserOperation

`boolean`
A flag that determines whether the mutation is still running or not.

### error

`Error | null`
A field that relays any errors from the mutation. It is null if there is no error.
