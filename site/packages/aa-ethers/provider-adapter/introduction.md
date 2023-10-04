---
outline: deep
head:
  - - meta
    - property: og:title
      content: EthersProviderAdapter
  - - meta
    - name: description
      content: Overview of the EthersProviderAdapter class in aa-ethers
  - - meta
    - property: og:description
      content: Overview of the EthersProviderAdapter class in aa-ethers
---

# EthersProviderAdapter

`EthersProviderAdapter` is an extension of the ethers.js `JsonRpcProvider` which includes a `SmartAccountProvider` field to integrate [EIP-4337](https://eips.ethereum.org/EIPS/eip-4337) smart contract accounts. The interface is similar to a standard `JsonRpcProvider`, with additional methods to leverage the Alchemy Account Abstraction stack.

Notable differences between `EthersProviderAdapter` and `JsonRpcProvider` are implementations for:

1.  [`send`](/packages/aa-ethers/provider-adapter/send) -- sends [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193)-compliant requests through the account provider.
2.  [`connectToAccount`](/packages/aa-ethers/provider-adapter/connectToAccount) -- connects the provider to an account and returns an `AccountSigner`.
3.  [`getPublicErc4337Client`](/packages/aa-ethers/provider-adapter/getPublicErc4337Client) -- gets the underlying viem cliemt with ERC-4337 compatability.
4.  [`fromEthersProvider`](/packages/aa-ethers/provider-adapter/fromEthersProvider) -- static method that converts an ethers.js `JsonRpcProvider` to an `EthersProviderAdapter`.

## Usage

::: code-group

```ts [example.ts]
import { provider } from "./provider";
// [!code focus:99]
// EIP-1193 compliant requests
const chainId = await provider.send("eth_chainId", []);

// get the provider's underlying viem client with EIP-4337 capabilties
const client = provider.getPublicErc4337Client();

// connect the provider to an AccountSigner
const owner: SmartAccountSigner = LocalAccountSigner.mnemonicToAccountSigner(
  process.env.YOUR_OWNER_MNEMONIC!
);
const signer = provider.connectToAccount(
  (rpcClient) =>
    new LightSmartContractAccount({
      entryPointAddress: entryPointAddress,
      chain: polygonMumbai,
      factoryAddress: "0xfactoryAddress",
      rpcClient,
      owner,
    })
);
```

<<< @/snippets/ethers-provider.ts
:::
