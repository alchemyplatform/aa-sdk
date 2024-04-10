---
outline: deep
head:
  - - meta
    - property: og:title
      content: useSmartAccountClient
  - - meta
    - name: description
      content: An overview of the useSmartAccountClient hook
  - - meta
    - property: og:description
      content: An overview of the useSmartAccountClient hook
  - - meta
    - name: twitter:title
      content: useSmartAccountClient
  - - meta
    - name: twitter:description
      content: An overview of the useSmartAccountClient hook
---

# useSmartAccountClient

The `useSmartAccountClient` hook is used to create a new [`AlchemySmartAccountClient`](/packages/aa-alchemy/smart-account-client/index) attached to either a `LightAccount` or `MultiOwnerModularAccount` contract using the `AlchemySigner`.

## Import

```ts
import { useSmartAccountClient } from "@alchemy/aa-alchemy/react";
```

## Usage

<<< @/snippets/react/useSmartAccountClient.tsx

## Parameters

```ts
import { type UseSmartAccountClientProps } from "@alchemy/aa-alchemy/react";
```

### type

`"LightAccount" | "MultiOwnerModularAccount"`

The underlying account type you want to use

### accountParams

```ts
  | Omit<CreateLightAccountParams, "signer" | "transport" | "chain">
  | Omit<CreateMultiOwnerModularAccountParams, "signer" | "transport" | "chain">
  | undefined
```

An optional param object based on the `type` property passed in above. It allows for overriding the default account parameters.

::: details CreateLightAccountParams
<<< @/../packages/accounts/src/light-account/account.ts#CreateLightAccountParams
:::

::: details CreateMultiOwnerModularAccountParams
<<< @/../packages/accounts/src/msca/account/multiOwnerAccount.ts#CreateMultiOwnerModularAccountParams
:::

### ...rest

```ts
Omit<
  AlchemySmartAccountClientConfig<
    TTransport,
    TChain,
    SupportedAccount<TAccount>
  >,
  "rpcUrl" | "chain" | "apiKey" | "jwt" | "account"
>;
```

The remaining parameters that are accepted allow for overriding certain properties of the `AlchemySmartAccountClient`

::: details AlchemySmartAccountClientConfig
<<< @/../packages/alchemy/src/client/smartAccountClient.ts#AlchemySmartAccountClientConfig
:::

## Return Type

```ts
import { type UseSmartAccountClientResult } from "@alchemy/aa-alchemy/react";
```

### client

`AlchemySmartAccountClient | undefined`
Once the underlying account is created, this will be an instance of an [`AlchemySmartAccountClient`](/packages/aa-alchemy/smart-account-client/index.html) connected to an instance of the account type specified.

### isLoadingClient

`boolean`
Indicates whether the client is still being created.
