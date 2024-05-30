---
title: EthersProviderAdapter
description: Overview of the EthersProviderAdapter class in aa-ethers
---

# EthersProviderAdapter

`EthersProviderAdapter` is an extension of the `ethers.js` `JsonRpcProvider` which includes a `SmartAccountClient` field to integrate [EIP-4337](https://eips.ethereum.org/EIPS/eip-4337) smart accounts. The interface is similar to a standard `JsonRpcProvider`, with additional methods to leverage the Alchemy Account Abstraction stack.

Notable differences between `EthersProviderAdapter` and `JsonRpcProvider` are implementations for:

1.  [`send`](/packages/aa-ethers/provider-adapter/send) -- sends [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193)-compliant requests through the account provider.
2.  [`connectToAccount`](/packages/aa-ethers/provider-adapter/connectToAccount) -- connects the provider to an account and returns an `AccountSigner`.
3.  [`getBundlerClient`](/packages/aa-ethers/provider-adapter/getBundlerClient) -- gets the underlying viem client with ERC-4337 compatibility.
4.  [`fromEthersProvider`](/packages/aa-ethers/provider-adapter/fromEthersProvider) -- static method that converts an `ethers.js` `JsonRpcProvider` to an `EthersProviderAdapter`.

## Usage

:::code-group

```ts [example.ts]
import { provider } from "./ethers-provider";
import {
  LightSmartContractAccount,
  getDefaultLightAccountFactoryAddress,
} from "@alchemy/aa-accounts";
import { LocalAccountSigner, type SmartAccountSigner } from "@alchemy/aa-core";
import { polygonMumbai } from "@alchemy/aa-core";
import { http } from "viem";

// [!code focus:99]
// EIP-1193 compliant requests
const chainId = await provider.send("eth_chainId", []);

// get the provider's underlying viem client with EIP-4337 capabilities
const client = provider.getBundlerClient();

// connect the provider to an AccountSigner
const signer: SmartAccountSigner = LocalAccountSigner.mnemonicToAccountSigner(
  process.env.YOUR_OWNER_MNEMONIC!
);
const accountSigner = provider.connectToAccount(
  await createLightAccount({
    chain,
    transport: http("RPC_URL"),
    signer,
  })
);
```

```ts [ethers-provider.ts]
// [!include ~/snippets/aa-ethers/ethers-provider.ts]
```

:::
