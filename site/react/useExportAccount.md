---
outline: deep
head:
  - - meta
    - property: og:title
      content: useExportAccount
  - - meta
    - name: description
      content: An overview of the useExportAccount hook
  - - meta
    - property: og:description
      content: An overview of the useExportAccount hook
  - - meta
    - name: twitter:title
      content: useExportAccount
  - - meta
    - name: twitter:description
      content: An overview of the useExportAccount hook
---

# useExportAccount

The `useExportAccount` hook exports the user's Embedded Account's recovery details to be viewable on the application.

::: warning
This requires your user to be logged in. See [`useAuthenticate`](/react/useAuthenticate) for more details.
:::

## Import

```ts
import { useExportAccount } from "@alchemy/aa-alchemy/react";
```

## Usage

<<< @/snippets/react/useExportAccount.tsx

## Params

<!--@include: ./BaseHookMutationArgs.md-->

## Return Type

```ts
import { type UØseExportAccountResult } from "@alchemy/aa-alchemy/react";
```

Returns an object containing the following state.

### exportAccount

`UseMutateFunction`
A React query mutation function to export the user's account recovery details. It returns a `boolean` to flag whether or not the account's private key or recovery phrase was correctly exported.

### isExported

`boolean`
A flag that determines whether the account recovery details were successfully exported and now viewable in the application.

### ExportAccountComponent

`JSX.Element`
A React component you can use to render the exported account recovery details in an iFrame. It takes in props to determine the the styling of the iframee and parent element, and a boolean flag to show the details if they successfully rendered using the mutation function above.

### isExporting

`boolean`
A flag that determines whether the mutation is still running or not.

### error

`Error | null`
A field that relays any errors from the mutation. It is null if there is no error.
