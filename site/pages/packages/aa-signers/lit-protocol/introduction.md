---
title: LitSigner
description: Overview of the LitSigner class in aa-signers
---

# Lit Signer

`LitSigner` provides implementations for all methods on `SmartAccountAuthenticator` to leverage Lit-Protocol's `PkpEthersWallet` and `LitNodeClient` together for provisioning new `Wallet` Signer instances with the authentication steps scoped to `authenticate`.

For more information on Lit's supported authentication, see: [here](https://developer.litprotocol.com/v3/sdk/authentication/session-sigs/intro)

['authenticate'][/packages/aa-signers/lit-protocol/authenticate]
['getAddress'][/packages/aa-signers/lit-protocol/getAddress]
['signTypedData'][/packages/aa-signers/lit-protocol/signTypedData]
['signMessage'][/packages/aa-signers/lit-protocol/signMessage]
['getAuthDetails'][/packages/aa-signers/lit-protocol/getAuthDetails]

## Install Dependencies

:::code-group

```bash [npm]
npm i -s @lit-protocol/lit-node-client@cayenne
npm i -s @lit-protocol/pkp-ethers@cayenne
npm i -s @lit-protocol/crypto@cayenne
npm i -s @lit-protocol/auth-helpers@cayenne
```

```bash [yarn]
yarn add @lit-protocol/lit-node-client@cayenne
yarn add @lit-protocol/pkp-ethers@cayenne
yarn add @lit-protocol/crypto@cayenne
yarn add @lit-protocol/auth-helpers@cayenne
```
