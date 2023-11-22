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

You can either pass in a constructed `Web3Auth` object, or directly pass into the `Web3AuthSigner` the `Web3AuthOptions` used to construct a `Web3Auth` object. These parameters are listed on the [web3auth docs](https://web3auth.io/docs/sdk/pnp/web/modal/initialize#web3authoptions) as well.

`Web3AuthOptions` takes in the following parameters:

- `clientId: string` -- a web3Auth client ID. You can get one at the [Web3Auth Developer Dashboard](https://dashboard.web3auth.io/).

- `chainConfig: Object` -- the custom chain configuration for chainNamespace.

  - `chainNamespace: "eip155" | "solana" | "other"`-- the type of chain.

  - `chainId: string`-- [optional] the id of the chain.

  - `rpcTarget: string`-- [optional] the RPC URL of the HTTP provider for the chain.

  - `wsTarget: string`-- [optional] the RPC URL of the websocket provider for the chain.

  - `blockExplorer: string`-- [optional] the url of the block explorer

  - `ticker: string`-- [optional] the currency ticker of the network. Default to "ETH".

  - `tickerName: string`-- [optional] the name for currency ticker. Defaults to "Ethereum".

  - `decimals: number`-- [optional] the number of decimals for the currency ticker. Defaults to 18.

- `web3AuthNetwork: "mainnet" | "testnet" | "cyan" | "aqua" | "celeste" | "sapphire_devnet" | "sapphire_mainnet"` -- [optional] the web3auth network to use for the session & the issued idToken.

- `authMode: "DAPP" | "WALLET"` -- [optional] flag to determine which adapter to use. Dapps should use "DAPP", and Wallets should use "WALLET".

- `uiConfig: Object` -- [optional] the config for configuring modal ui display properties.

  - `loginMethodsOrder: string[]` -- [optional] the order of how login methods are shown.

  - `modalZIndex: string` -- [optional] the Z-index of the modal and iframe.

  - `displayErrorsOnModal: boolean` -- [optional] toggle to show errors on Web3Auth modal or not.

  - `loginGridCol: 2 | 3` -- [optional] the number of columns to display the Social Login buttons.

  - `primaryButton: "externalLogin" | "socialLogin" | "emailLogin"` -- [optional] flag to decide which button will be displayed as primary button in modal.

- `enableLogging: boolean` -- [optional] toggle to enable logs.

- `storageKey: "session" | "local"` -- [optional] flag on whether to persist social login session across tabs. Defaults to "local".

- `sessionTime: number` -- [optional] the time (in seconds) for idToken issued by Web3Auth for server side verification. Defaults to 86,400 seconds (1 day).

- `useCoreKitKey: boolean` -- [optional] toggle to use core-kit key with web3auth provider. Defaults to false.
