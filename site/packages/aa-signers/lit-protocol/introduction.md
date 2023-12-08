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

# lit signer

`LitSigner` provides implementations for all methods on `SmartAccountAuthenticator` to leverage the `PkpEthersWallet` and `LitNodeClient` together for provisioning new `Wallet instances` with the authentication steps scopes within `authenticate`.

`LitSigner` provides implementations for all methods on `SmartAccountAuthenticator`

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
```

```bash [yarn]
yarn add @lit-protocol/lit-node-client
yarn add @lit-protocol/pkp-ethers
```
