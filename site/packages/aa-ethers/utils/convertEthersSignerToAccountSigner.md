---
outline: deep
head:
  - - meta
    - property: og:title
      content: Utils • convertEthersSignerToAccountSigner
  - - meta
    - name: description
      content: Overview of the convertEthersSignerToAccountSigner method in aa-ethers
  - - meta
    - property: og:description
      content: Overview of the convertEthersSignerToAccountSigner method in aa-ethers
---

# Utils

`convertEthersSignerToAccountSigner` converts your ethers.js `Signer` object into an `SmartAccountSigner` by deriving implementations of its methods: `getAddress`, `signMessage`, and `signTypedData`.

Note that the `signTypedData` implementation is to throw an error since it is not supported by ethers.js `Signer`. If you're looking for an implementation, consideration using [`convertWalletToAccountSigner`](/packages/aa-ethers/utils/convertWalletToAccountSigner).

## Usage

::: code-group

```ts [example.ts]
// note that `signTypedData` is not supported by the Signer class, and so this util method cannot derive an implementation of said method for LocalAccountSigner
const accountSigner = convertEthersSignerToAccountSigner(wallet);
```

:::

## Returns

### `SmartAccountSigner`

An instance of `SmartAccountSigner` with implementations derived from the inputted ethers.js `Signer`

## Parameters

### `signer: Signer`

An ethers.js `Signer` object
