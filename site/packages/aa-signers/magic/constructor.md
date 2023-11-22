---
outline: deep
head:
  - - meta
    - property: og:title
      content: MagicSigner • constructor
  - - meta
    - name: description
      content: Overview of the constructor method on MagicSigner in aa-signers
  - - meta
    - property: og:description
      content: Overview of the constructor method on MagicSigner in aa-signers
---

# constructor

To initialize a `MagicSigner`, you must provide a set of parameters detailed below.

## Usage

::: code-group

```ts [example.ts]
import { MagicSigner } from "@alchemy/aa-signers";

// instantiates using every possible parameter, as a reference
const magicSigner = new MagicSigner({
  apiKey: "MAGIC_API_KEY",
  options: {
    endpoint: "MAGIC_IFRAME_URL",
    locale: "en_US",
    network: "sepolia",
    testMode: false,
  },
});
```

:::

## Returns

### `MagicSigner`

A new instance of a `MagicSigner`.

## Parameters

### `params: MagicSDKParams | { inner: Magic }`

You can either pass in a constructed `Magic` object, or directly pass into the `MagicSigner` the `MagicSDKParams` used to construct a `Magic` object. These parameters are listed on the [Magic Docs](https://magic.link/docs/api/client-side-sdks/web#constructor-NaN) as well.

`MagicSDKParams` takes in the following parameters:

- `apiKey: string` -- a Magic API Key. You can get one at [Magic Dashboard](https://dashboard.magic.link/).

- `options: MagicSDKAdditionalConfiguration` -- [optional]

  - `endpoint: string` -- [optional] a URL pointing to the Magic `<iframe` application.

  - `locale: string` -- [optional] customize the language of Magic's modal, email and confirmation screen.

  - `network: string` -- [optional] a representation of the connected Ethereum network (mainnet or goerli).

  - `testMode: boolean` -- [optional] toggle the login behavior to not have to go through the auth flow.
