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

## Import

```ts
import { useExportAccount } from "@alchemy/aa-alchemy/react";
```

## Usage

<<< @/snippets/react/useExportAccount.tsx

## Return Type

```ts
import { type useExportAccountResult } from "@alchemy/aa-alchemy/react";
```

Returns a `boolean` to flag whether or not the account's private key or recovery phrase was correctly exported.
