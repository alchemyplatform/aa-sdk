---
title: alchemyEnhancedApiActions
description: Overview of the alchemyEnhancedApiActions method on Alchemy Smart
  Account Client in aa-alchemy
---

# alchemyEnhancedApiActions

`alchemyEnhancedApiActions` is a decorator that can be used with a `AlchemySmartAccountClient` that will extend the client with methods that access the Alchemy [Enhanced APIs](https://www.alchemy.com/enhanced-apis/?a=ak-docs) via the [Alchemy SDK](https://github.com/alchemyplatform/alchemy-sdk-js).

:::tip[Note]
This method requires an optional dependency on the [`alchemy-sdk`](https://github.com/alchemyplatform/alchemy-sdk-js) package, as the input to this method is an Alchemy SDK client.

The Alchemy SDK client must be configured with the same API key and network as the `AlchemySmartAccountClient`. This method validates such at runtime.

Additionally, since the Alchemy SDK client does not yet support JWT authentication, an `AlchemySmartAccountClient` initialized with JWTs cannot use this method. They must be initialized with an API key or RPC URL.
:::

## Usage

:::code-group

```ts [example.ts]
import { smartAccountClient } from "./base-client.ts";
import { alchemyEnhancedApiActions } from "@alchemy/aa-alchemy";
// [!code focus:99]

const alchemy = new Alchemy();

// use Alchemy Enhanced APIs
const clientWithEnhancedApis = smartAccountClient.extend(
  alchemyEnhancedApiActions
);
```

```ts [smartAccountClient.ts]
// [!include ~/snippets/aa-alchemy/base-client.ts]
```

:::

## Returns

### `AlchemySmartAccountClient`

A new instance of an `AlchemySmartAccountClient` with the same attributes as the input, now with methods for accessing the Alchemy Enhanced APIs to more efficiently query blockchain data.

## Parameters

### `alchemy: Alchemy` -- an initialized Alchemy SDK client
