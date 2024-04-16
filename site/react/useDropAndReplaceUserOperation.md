---
outline: deep
head:
  - - meta
    - property: og:title
      content: useDropAndReplaceUserOperation
  - - meta
    - name: description
      content: An overview of the useDropAndReplaceUserOperation hook
  - - meta
    - property: og:description
      content: An overview of the useDropAndReplaceUserOperation hook
  - - meta
    - name: twitter:title
      content: useDropAndReplaceUserOperation
  - - meta
    - name: twitter:description
      content: An overview of the useDropAndReplaceUserOperation hook
---

# useDropAndReplaceUserOperation

The `useDropAndReplaceUserOperation` hook enables dropping and replaicng a User Operation sent from a user's Embedded Account.

::: warning
This requires your user to be logged in. See [`useAuthenticate`](/react/useAuthenticate) for more details.
:::

## Import

```ts
import { useDropAndReplaceUserOperation } from "@alchemy/aa-alchemy/react";
```

## Usage

<<< @/snippets/react/useDropAndReplaceUserOperation.tsx

## Params

### client

`AlchemySmartAccountClient | undefined`
A `AlchemySmartAccountClient` with methods to interact with an Alchemy smart account.

Additionally, <!--@include: ./BaseHookMutationArgs.md-->

## Return Type

```ts
import { type UseDropAndReplaceUserOperationResult } from "@alchemy/aa-alchemy/react";
```

Returns an object containing the following state.

### dropAndReplaceUserOperation

`UseMutateFunction`
A React query mutation function to sign a message. It returns a `SendUserOperationResult` object.

::: details SendUserOperationResult
<<< @/../packages/core/src/client/types.ts#SendUserOperationResult
:::

It takes in `DropAndReplaceUserOperationParameters` which has the following type:

::: details DropAndReplaceUserOperationParameters
<<< @/../packages/core/src/actions/smartAccount/types.ts#DropAndReplaceUserOperationParameters
:::

### dropAndReplaceUserOperationResult

An object of the following `SendUserOperationResult` type if the mutation has run successfully, `undefined` otherwise:
::: details SendUserOperationResult
<<< @/../packages/core/src/client/types.ts#SendUserOperationResult
:::

### isDroppingAndReplacingUserOperation

`boolean`
A flag that determines whether the mutation is still running or not.

### error

`Error | null`
A field that relays any errors from the mutation. It is null if there is no error.
