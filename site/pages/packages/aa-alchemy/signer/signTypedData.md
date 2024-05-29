---
outline: deep
head:
  - - meta
    - property: og:title
      content: Alchemy Signer • signTypedData
  - - meta
    - name: description
      content: Learn how to use the AlchemySigner.signTypedData method
  - - meta
    - property: og:description
      content: Learn how to use the AlchemySigner.signTypedData method
  - - meta
    - name: twitter:title
      content: Alchemy Signer • signTypedData
  - - meta
    - name: twitter:description
      content: Learn how to use the AlchemySigner.signTypedData method
---

# signTypedData

The `signTypedData` method is used to sign typed data with the Alchemy Signer.

:::warning
This method throws if there is no authenticated user.
:::

## Usage

:::code-group

```ts [example.ts]
import { signer } from "./signer";

const signature = await signer.signTypedData(typedDataParams);
```

```ts [signer.ts]
// [!include ~/snippets/signers/alchemy/signer.ts]
```

:::

## Returns

`Promise<Hex>` -- on success returns the signature of the message.

## Parameters

`params: TypedDataDefinition` -- the typed data definition of the message you want to sign
