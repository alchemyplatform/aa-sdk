---
outline: deep
head:
  - - meta
    - property: og:title
      content: Alchemy Signer • Overview
  - - meta
    - name: description
      content: Learn how to get started with the Alchemy Signer
  - - meta
    - property: og:description
      content: Learn how to get started with the Alchemy Signer
  - - meta
    - name: twitter:title
      content: Alchemy Signer
  - - meta
    - name: twitter:description
      content: Learn how to get started with the Alchemy Signer
---

# AlchemySigner

The Alchemy Signer is a `SmartAccountSigner` that is powered by Alchemy's Signer Infrastructure. Using the Alchemy Signer, you can get started building embedded accounts with just an Alchemy API key!

::: warning
The Alchemy Signer is currently still under development and is not yet available for public use. If you are interested in using the Alchemy Signer, please reach out to us at [account-abstraction@alchemy.com](mailto:account-abstraction@alchemy.com).
:::

## Usage

Once you've been granted access to the Alchemy Signer, getting started is really simple. Install the `@alchemy/aa-alchemy` package and initialize your signer:

<<< @/snippets/signers/alchemy/signer.ts

## Returns

`AlchemySigner` -- an instance of the AlchemySigner that can be used as a signer on `SmartContractAccount` instances

## Parameters

`AlchemySignerParams` -- an object that contains the following properties:

- `client: AlchemySignerClient | AlchemySignerClientParams` -- the underlying client to use for the signer. The `AlchemySignerClientParams` are defined as follows:
  - `connection: ConnectionConfig` -- the api config to use for calling Alchemy's APIs.
  - `iframeConfig: IframeConfig` -- the config to use for the iframe that will be used to interact with the signer.
    - `iframeElementId?: string` -- the id of the iframe element that will be injected into the DOM [default: "turnkey-iframe"]
    - `iframeContainerId: string` -- the id of the iframe container that you have injected into your DOM
- `sessionConfig?: SessionConfig` -- optional parameter used to configure user sessions
  - `sessionKey?: string` -- the key that the session will be stored to in your chosen storage [default: "alchemy-signer-session"]
  - `storage?: "localStorage" | "sessionStorage"` -- the storage to use for the session [default: "localStorage"]
  - `expirationTimeMs?: number` -- the time in milliseconds that the session will be valid for [default: 15 minutes]
