---
outline: deep
head:
  - - meta
    - property: og:title
      content: Utils
  - - meta
    - name: description
      content: Overview of the Utils methods in aa-ethers
  - - meta
    - property: og:description
      content: Overview of the Utils methods in aa-ethers
---

# Utils

`aa-ethers` offers util methods to speed up your development with `EthersProviderAdapter` and `AccountSigner`.

Notable util methods include:

1.  [`convertWalletToAccountSigner`](/packages/aa-ethers/utils/convertWalletToAccountSigner) -- converts your ethers.js `Wallet` object into an `SmartAccountSigner` by deriving implementations of its methods.
2.  [`convertEthersSignerToAccountSigner`](/packages/aa-ethers/utils/convertEthersSignerToAccountSigner) -- converts your ethers.js `Signer` object into an `SmartAccountSigner` by deriving implementations of its methods.

## Usage

::: code-group

```ts [example.ts]
// Wallet is a subclass of Signer, and so can be used with either convertor method
const wallet = new Wallet(process.env.PRIVATE_KEY!);
const accountSigner1 = convertWalletToAccountSigner(wallet);

// note that `signTypedData` is not supported by the Signer class, and so this util method cannot derive an implementation of said method for LocalAccountSigner
const accountSigner2 = convertEthersSignerToAccountSigner(wallet);
```

:::
