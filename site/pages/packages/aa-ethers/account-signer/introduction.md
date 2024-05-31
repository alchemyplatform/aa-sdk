---
title: AccountSigner
description: Overview of the AccountSigner class in aa-ethers
---

# AccountSigner

`AccountSigner` is an extension of the ethers.js `Signer` which includes a implementation of `SmartContractAccount` to integrate [EIP-4337](https://eips.ethereum.org/EIPS/eip-4337) smart accounts. The interface is similar to a standard `Signer`, with additional methods to leverage the Alchemy Account Abstraction stack.

Notable differences between `EthersProviderAdapter` and `JsonRpcProvider` are implementations for:

1.  [`getAddress`](/packages/aa-ethers/account-signer/getAddress) -- gets the `AccountSigner`'s smart account address.
2.  [`signMessage`](/packages/aa-ethers/account-signer/signMessage) -- signs messages with the `AccountSigner`'s EOA signer address.
3.  [`sendTransaction`](/packages/aa-ethers/account-signer/sendTransaction) -- sends transactions on behalf of the `AccountSigner`'s connected signer, with request and response formatted as if you were using the ethers.js library.
4.  [`getBundlerClient`](/packages/aa-ethers/account-signer/getBundlerClient) -- gets the underlying viem client with ERC-4337 compatibility.
5.  [`connect`](/packages/aa-ethers/account-signer/connect) -- connects the inputted provider to an account and returns an `AccountSigner`.

## Usage

:::code-group

```ts [example.ts]
import { accountSigner } from "./ethers-signer";

// get the account signer's account address
const address = await accountSigner.getAddress();

// sign message with the account signer's EOA signer address
const signedMessage = await accountSigner.signMessage("test");

// sends transaction on behalf of the smart account connected EOA signer
const txn = await accountSigner.sendTransaction({
  to: "0xRECIPIENT_ADDRESS",
  data: "0xDATA",
});

// get the account signer's underlying viem client with EIP-4337 capabilities
const client = accountSigner.getBundlerClient();
```

```ts [ethers-signer.ts]
// [!include ~/snippets/aa-ethers/ethers-signer.ts]
```

:::
