---
outline: deep
head:
  - - meta
    - property: og:title
      content: LitSigner
  - - meta
    - name: description
      content: Overview of the LitSigner class in aa-signers
  - - meta
    - property: og:description
      content: Overview of the LitSigner class in aa-signers
---

# Lit Signer

`LitSigner` provides implementations for all methods on `SmartAccountAuthenticator` to leverage Lit-Protocol's `PkpEthersWallet` and `LitNodeClient` together for provisioning new `Wallet` Signer instances with the authentication steps scoped to `authenticate`.

For more information on Lit's supported authentication, see: [here](https://developer.litprotocol.com/v3/sdk/authentication/session-sigs/intro)

['authenticate'][/packages/aa-signers/lit-protocol/authenticate]
['getAddress'][/packages/aa-signers/lit-protocol/getAddress]
['signTypedData'][/packages/aa-signers/lit-protocol/signTypedData]
['signMessage'][/packages/aa-signers/lit-protocol/signMessages]
['getAuthDetails'][/packages/aa-signers/lit-protocol/getAuthDetails]

## Install Dependencies

::: code-group

```bash [npm]
npm i -s @lit-protocol/lit-node-client
npm i -s @lit-protocol/pkp-ethers
npm i -s @lit-protocol/crypto
npm i -s @lit-protocol/auth-helpers
```

```bash [yarn]
yarn add @lit-protocol/lit-node-client
yarn add @lit-protocol/pkp-ethers
yarn add @lit-protocol/crypto
yarn add @lit-protocol/auth-helpers
```
