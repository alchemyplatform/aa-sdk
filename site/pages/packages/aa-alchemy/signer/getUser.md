---
outline: deep
head:
  - - meta
    - property: og:title
      content: Alchemy Signer • getUser
  - - meta
    - name: description
      content: Learn how to use the AlchemySigner.getUser method
  - - meta
    - property: og:description
      content: Learn how to use the AlchemySigner.getUser method
  - - meta
    - name: twitter:title
      content: Alchemy Signer • getUser
  - - meta
    - name: twitter:description
      content: Learn how to use the AlchemySigner.getUser method
---

# getUser

The `getUser` method is used to look up if a user already exists for a given email address

## Usage

:::code-group

```ts [example.ts]
import { signer } from "./signer";

const result = await signer.getUser("moldy@email.com");
```

```ts [signer.ts]
// [!include ~/snippets/signers/alchemy/signer.ts]
```

:::

## Returns

`Promise<{orgId: string} | null>` -- if a user exists, this will return an object with the orgId of the user. If no user exists, this will return `null`.
