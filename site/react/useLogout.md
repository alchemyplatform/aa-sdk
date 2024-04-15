---
outline: deep
head:
  - - meta
    - property: og:title
      content: useLogout
  - - meta
    - name: description
      content: An overview of the useLogout hook
  - - meta
    - property: og:description
      content: An overview of the useLogout hook
  - - meta
    - name: twitter:title
      content: useLogout
  - - meta
    - name: twitter:description
      content: An overview of the useLogout hook
---

# useLogout

The `useLogout` hook logs a user out of their Embedded Account on your application.

## Import

```ts
import { useLogout } from "@alchemy/aa-alchemy/react";
```

## Usage

<<< @/snippets/react/useLogout.tsx

## Params

<!--@include: ./BaseHookMutationArgs.md-->

## Return Type

```ts
import { type useLogoutResult } from "@alchemy/aa-alchemy/react";
```

Returns an object containing the following state.

### logoout

`UseMutateFunction`
A React query mutation function to log the user out.

### isLoggingOut

`boolean`
A flag that determines whether the mutation is still running or not.

### error

`Error | null`
A field that relays any errors from the mutation. It is null if there is no error.
