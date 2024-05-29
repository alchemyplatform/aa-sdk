---
outline: deep
head:
  - - meta
    - property: og:title
      content: Alchemy Signer • disconnect
  - - meta
    - name: description
      content: Learn how to use the AlchemySigner.disconnect method
  - - meta
    - property: og:description
      content: Learn how to use the AlchemySigner.disconnect method
  - - meta
    - name: twitter:title
      content: Alchemy Signer • disconnect
  - - meta
    - name: twitter:description
      content: Learn how to use the AlchemySigner.disconnect method
---

# disconnect

The `disconnect` method is used to disconnect a user from the Alchemy Signer and clear the local session.

## Usage

:::code-group

```ts [example.ts]
import { signer } from "./signer";

await signer.disconnect();
```

```ts [signer.ts]
// [!include ~/snippets/signers/alchemy/signer.ts]
```

:::
