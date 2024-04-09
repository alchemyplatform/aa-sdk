---
outline: deep
head:
  - - meta
    - property: og:title
      content: useAccount
  - - meta
    - name: description
      content: An overview of the useAccount hook
  - - meta
    - property: og:description
      content: An overview of the useAccount hook
  - - meta
    - name: twitter:title
      content: useAccount
  - - meta
    - name: twitter:description
      content: An overview of the useAccount hook
---

# useAccount

The `useAccount` hook is used to create a new `LightAccount` or `MultiOwnerModularAccount` contract using the `AlchemySigner` provided by the Accounts Context. This hook is mainly useful if you just want to use information from the account. In most cases, however, the [`useSmartAccountClient`](/react/useSmartAccountClient) hook is more useful since the resulting client contains the account for you to use as well.

## Import

```ts
import { useAccount } from "@alchemy/aa-alchemy/react";
```

## Usage

<<< @/snippets/react/useAccount.tsx

## Parameters

```ts
import { type UseAccountProps } from "@alchemy/aa-alchemy/react";
```

### type

`"LightAccount" | "MultiOwnerModularAccount"`

The underlying account type you want to use

### accountParams

```ts
  | Omit<CreateLightAccountParams, "signer" | "transport" | "chain">
  | Omit<CreateMultiOwnerModularAccountParams,"signer" | "transport" | "chain">
  | undefined
```

An optional param object based on the `type` property passed in above. Allows for overriding the default account parameters.

::: details CreateLightAccountParams
<<< @/../packages/accounts/src/light-account/account.ts#CreateLightAccountParams
:::

::: details CreateMultiOwnerModularAccountParams
<<< @/../packages/accounts/src/msca/account/multiOwnerAccount.ts#CreateMultiOwnerModularAccountParams
:::

### skipCreate

An optional param that allows you to avoid creating a new instance of the account. This is useful if you know your account has already been created and cached locally.

## Return Type

```ts
import { type UseAccountResult } from "@alchemy/aa-alchemy/react";
```

### account

`LightAccount<AlchemySigner> | MultiOwnerModularAccount<AlchemySigner>`

An instance of the account specified by the `type` parameter.

### isLoadingAccount

`boolean`

Indicates whether or not the account is still being created.
