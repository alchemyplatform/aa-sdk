---
outline: deep
head:
  - - meta
    - property: og:title
      content: verifyEIP6492Signature
  - - meta
    - name: description
      content: Description of the verifyEIP6492Signature utility method
  - - meta
    - property: og:description
      content: Description of the verifyEIP6492Signature utility method
next:
  text: Public ERC-4337 Client
---

# verifyEIP6492Signature

Uses a the universal validator defined [here](https://github.com/AmbireTech/signature-validator/blob/main/index.ts#L13C17-L13C17) to verify a signature in the [ERC-6492](https://eips.ethereum.org/EIPS/eip-6492) format.

## Usage

::: code-group

```ts [example.ts]
import { verifyEIP6492Signature } from "@alchemy/aa-core";
import { http } from "viem";
import { mainnet } from "@alchemy/aa-core";

const signature = await verifyEIP6492Signature({
  signer: "0xAccountAddress",
  hash: "0xHashOfMessageBeingVerified",
  signature: "0xSignatureToVerify",
  client: createPublicClient({ transport: http(), chain: mainnet }),
});
```

:::

## Returns

### `Promise<boolean>`

Returns whether or not the signature is valid for the given Signer and message hash

## Parameters

### `VerifyEIP6492SignatureParams`

- #### `signer: Address`

  The address of the Signer of the message (e.g. the smart account address)

- #### `hash: Hash`

  The hash of the message being verified (e.g. the result of `hashMessage("hello world")`)

- #### `signature: Hex`

  The signature to verify (e.g. the result of `signMessage("hello world")`)

- #### `client: Client`

  The viem client used to make an `eth_call` to validate the signature. This client should be connected to the same chain that the undeployed account is on
