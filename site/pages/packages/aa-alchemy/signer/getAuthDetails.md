---
title: Alchemy Signer • getAuthDetails
description: Learn how to use the AlchemySigner.getAuthDetails method
---

# getAuthDetails

The `getAuthDetails` method is used to get the details of the currently authenticated user. This method will also use session storage to get the user's details if they are already authenticated.

:::warning
This method throws if there is no authenticated user.
:::

## Usage

:::code-group

```ts [example.ts]
import { signer } from "./signer";

const user = await signer.getAuthDetails();
```

```ts [signer.ts]
// [!include ~/snippets/signers/alchemy/signer.ts]
```

:::

## Returns

`Promise<User>` -- on success returns a `User` object representing the authenticated user.
