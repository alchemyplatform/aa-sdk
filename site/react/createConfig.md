---
outline: deep
head:
  - - meta
    - property: og:title
      content: createConfig
  - - meta
    - name: description
      content: An overview of the createConfig function
  - - meta
    - property: og:description
      content: An overview of the createConfig function
  - - meta
    - name: twitter:title
      content: createConfig
  - - meta
    - name: twitter:description
      content: An overview of the createConfig function
---

# createConfig

The `createConfig` method is used to create a configuration object that is used to initialize the `AlchemyAccountProvider`. The output of this function contains all of the state that will be used by the various hooks exported by `@alchemy/aa-alchemy/react`.

::: warning
It's not recommended to use the resulting config directly. However, if you are not using `React` it is possible to build your own custom hooks using the state contained in the config object.
:::

## Import

```ts
import { createConfig } from "@alchemy/aa-alchemy/config";
```

## Usage

<<< @/snippets/react/config.ts

## Parameters

```ts
import { type CreateConfigProps } from "@alchemy/aa-alchemy/config";
```

::: details CreateConfigProps
<<< @/../packages/alchemy/src/config/types.ts#CreateConfigProps
:::

::: details ConnectionConfig
<<< @/../packages/core/src/client/schema.ts#ConnectionConfigSchema
:::

## Return Type

```ts
import { type AlchemyAccountsConfig } from "@alchemy/aa-alchemy/config";
```

Returns an object containing the Alchemy Accounts state.

### bundlerClient

`ClientWithAlchemyMethods`
A JSON RPC client used to make requests to Alchemy's Nodes and Bundler.

### signer

`AlchemySigner`
The underlying signer instance used by Embedded Accounts. This property is only available on the client.

### coreStore

`CoreStore`
This store contains all of the state that can be used on either the client or the server.

### clientStore

`ClientStore`
This store contains only the state available on the client.
