---
outline: deep
head:
  - - meta
    - property: og:title
      content: AccountSigner
  - - meta
    - name: description
      content: Overview of the AccountSigner class in aa-ethers
  - - meta
    - property: og:description
      content: Overview of the AccountSigner class in aa-ethers
---

# AccountSigner

`AccountSigner` is an extension of the ethers.js `Signer` which includes a implementation of `ISmartContractAccount` to integrate [EIP-4337](https://eips.ethereum.org/EIPS/eip-4337) smart contract accounts. The interface is similar to a standard `Signer`, with additional methods to leverage the Alchemy Account Abstraction stack.

Notable differences between `EthersProviderAdapter` and `JsonRpcProvider` are implementations for:

1.  [`getAddress`](/packages/aa-ethers/account-signer/getAddress) -- gets the `AccountSigner`'s smart contract account address.
2.  [`signMessage`](/packages/aa-ethers/account-signer/signMessage) -- signs messages with the `AccountSigner`'s owner address.
3.  [`sendTransaction`](/packages/aa-ethers/account-signer/sendTransaction) -- sends transactions on behalf of the `AccountSigner`'s smart contract account, with request and response formatted as if you were using the ethers.js library.
4.  [`getPublicErc4337Client`](/packages/aa-ethers/account-signer/getPublicErc4337Client) -- gets the underlying viem cliemt with ERC-4337 compatability.
5.  [`connect`](/packages/aa-ethers/account-signer/connect) -- connects the inputted provider to an account and returns an `AccountSigner`.

## Usage

::: code-group

```ts [example.ts]
import { signer } from "./ethers-signer";

// get the signer's smart contract account address
const address = await signer.getAddress();

// sign message with the signer's owner address
const signedMessage = await signer.signMessage("test");

// sends transaction on behalf of the smart contract account
const txn = await signer.sendTransaction({
  to: "0xRECIPIENT_ADDRESS",
  data: "0xDATA",
});

// get the signer's underlying viem client with EIP-4337 capabilties
const client = signer.getPublicErc4337Client();
```

<<< @/snippets/ethers-signer.ts
:::
