---
outline: deep
title: Alchemy Signer • Manage user sessions
description: Learn how to configure and leverage sessions for you users with the Alchemy Signer
---

# User sessions

By default, `AlchemySigner` user sessions are cached in `localStorage` for 15 minutes.

You can customize session length by passing a [`sessionConfig`](/packages/aa-alchemy/signer/overview#parameters) to your `AlchemySigner` constructor.

You can check if the user has an active session with the following command:
:::code-group

```ts [getAuthDetails.ts]
import { signer } from "./signer";

// NOTE: this method throws if there is no authenticated user
// so we return null in the case of an error
const user = await signer.getAuthDetails().catch(() => null);
```

```ts [signer.ts]
// [!include ~/snippets/signers/alchemy/signer.ts]
```

:::

If there is an existing session, then your signer is ready for use! If not, see the section above for logging users in.
