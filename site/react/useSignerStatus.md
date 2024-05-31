---
outline: deep
head:
  - - meta
    - property: og:title
      content: useSignerStatus
  - - meta
    - name: description
      content: An overview of the useSignerStatus hook
  - - meta
    - property: og:description
      content: An overview of the useSignerStatus hook
  - - meta
    - name: twitter:title
      content: useSignerStatus
  - - meta
    - name: twitter:description
      content: An overview of the useSignerStatus hook
---

# useSignerStatus

The `useSignerStatus` hook returns an enum of the current status of the `AlchemySigner`.

## Import

```ts
import { useSignerStatus } from "@alchemy/aa-alchemy/react";
```

## Usage

<<< @/snippets/react/useSignerStatus.tsx

## Return Type

```ts
import { type UseSignerStatusResult } from "@alchemy/aa-alchemy/react";
```

### status

`"INITIALIZING" | "CONNECTED" | "DISCONNECTED" | "AUTHENTICATING" | "AWAITING_EMAIL_AUTH"`

The string representation of the current signer status.

### isInitializing

`boolean`

Returns `true` if the signer is initializing.

### isAuthenticating

`boolean`

Returns `true` if the signer is currently waiting for the user to complete the authentication process.

### isConnected

`boolean`
Returns `true` if the signer is authenticated.

### isDisconnected

`boolean`
Returns `true` if the signer is disconnected and unauthenticated.
