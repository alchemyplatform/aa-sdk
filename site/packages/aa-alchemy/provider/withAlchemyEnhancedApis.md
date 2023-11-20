---
outline: deep
head:
  - - meta
    - property: og:title
      content: AlchemyProvider • withAlchemyEnhancedApis
  - - meta
    - name: description
      content: Overview of the withAlchemyEnhancedApis method on Alchemy Provider in aa-alchemy
  - - meta
    - property: og:description
      content: Overview of the withAlchemyEnhancedApis method on Alchemy Provider in aa-alchemy
---

# withAlchemyEnhancedApis

`withAlchemyEnhancedApis` is a method on `AlchemyProvider` that you can optionally call to create a new provider instance with added methods that access the Alchemy [Enhanced APIs](https://www.alchemy.com/enhanced-apis) via the [Alchemy SDK](https://github.com/alchemyplatform/alchemy-sdk-js).

:::tip Note
This method requires an optional dependency on the [`alchemy-sdk`](https://github.com/alchemyplatform/alchemy-sdk-js) package, as the input to this method is an Alchemy SDK client.

The Alchemy SDK client must be configured with the same API key and network as the `AlchemyProvider`. This method validates such at runtime.

Additionally, since the Alchemy SDK client does not yet support JWT authentication, an `AlchemyProvider` initialized with JWTs cannot use this method. They must be initialized with an API key or RPC URL.
:::

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";
// [!code focus:99]

const alchemy = new Alchemy();

// use Alchemy Enhanced APIs
const providerWithEnhancedApis = provider.withAlchemyEnhancedApis(alchemy);
```

<<< @/snippets/provider.ts
:::

## Returns

### `AlchemyProvider`

A new instance of an `AlchemyProvider` with the same attributes as the input, now with methods for accessing the Alchemy Enhanced APIs to more efficiently query blockchain data.

## Parameters

### `alchemy: Alchemy` -- an initialized Alchemy SDK client
