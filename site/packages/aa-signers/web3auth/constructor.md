---
outline: deep
head:
  - - meta
    - property: og:title
      content: Web3AuthSigner • constructor
  - - meta
    - name: description
      content: Overview of the constructor method on Web3AuthSigner in aa-signers
  - - meta
    - property: og:description
      content: Overview of the constructor method on Web3AuthSigner in aa-signers
---

# constructor

To initialize a `Web3AuthSigner`, you must provide a set of parameters detailed below.

## Usage

::: code-group

```ts [example.ts]
import { Web3AuthSigner } from "@alchemy/aa-signers";

// instantiates using every possible parameter, as a reference
const web3AuthSigner = new Web3AuthSigner({
  clientId: "test",
  chainConfig: {
    chainNamespace: "eip155",
    chainId: "1",
    rpcTarget: "RPC_URL",
    wsTarget: "WS_RPC_URL",
    displayName: "test",
    blockExplorer: "BLOCK_EXPLORER_URL",
    ticker: "ETH",
    tickerName: "Ethereum",
    decimals: 18,
  },
  web3AuthNetwork: "mainnet",
  authMode: "DAPP",
  uiConfig: {
    loginMethodsOrder: ["google", "facebook", "email"],
    modalZIndex: "999998",
    displayErrorsOnModal: true,
    loginGridCol: 3,
    primaryButton: "socialLogin",
  },
  enableLogging: true,
  storageKey: "local",
  sessionTime: 86400,
  useCoreKitKey: true,
});
```

:::

## Returns

### `Web3AuthSigner`

A new instance of a `Web3AuthSigner`.

## Parameters

### `params: Web3AuthOptions | { inner: Web3Auth }`

You can either pass in a constructed `Web3Auth` object, or directly pass into the `Web3AuthSigner` the `Web3AuthOptions` used to construct a `Web3Auth` object. These parameters are listed on the [web3auth docs](https://magic.link/docs/api/client-side-sdks/web#constructor-NaN) as well.

`Web3AuthOptions` takes in the following parameters:

- `clientId: string` -- a web3Auth client ID. You can get one at the [Web3Auth Developer Dashboard](https://dashboard.web3auth.io/).

- `chainConfig: Object` -- [optional]

  - `chainNamespace: string`--

  - `chainNamespace`--

- `uiConfig: Object` -- [optional]

  - `endpoint: string` -- [optional] a URL pointing to the Magic `<iframe` application.

  - `locale: string` -- [optional] customize the language of Magic's modal, email and confirmation screen.

  - `network: string` -- [optional] a representation of the connected Ethereum network (mainnet or goerli).

  - `testMode: boolean` -- [optional] toggle the login behavior to not have to go through the auth flow.
