---
outline: deep
head:
  - - meta
    - property: og:title
      content: useUser
  - - meta
    - name: description
      content: An overview of the useUser hook
  - - meta
    - property: og:description
      content: An overview of the useUser hook
  - - meta
    - name: twitter:title
      content: useUser
  - - meta
    - name: twitter:description
      content: An overview of the useUser hook
---

# useUser

The `useUser` hook returns the authenticated [`User`](accountkit.alchemy.com/resources/types.html#user) if the signer is authenticated.

## Import

```ts
import { useUser } from "@alchemy/aa-alchemy/react";
```

## Usage

<<< @/snippets/react/useUser.tsx

## Return Type

```ts
import { type UseUserResult } from "@alchemy/aa-alchemy/react";
```

Returns a `User` object if the user has been authenticated, othwerise `null`.
