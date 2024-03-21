---
outline: deep
head:
  - - meta
    - property: og:title
      content: Alchemy Signer • Manage user sessions
  - - meta
    - name: description
      content: Learn how to configure and leverage sessions for you users with the Alchemy Signer
  - - meta
    - property: og:description
      content: Learn how to configure and leverage sessions for you users with the Alchemy Signer
  - - meta
    - name: twitter:title
      content: Alchemy Signer • Manage user sessions
  - - meta
    - name: twitter:description
      content: Learn how to configure and leverage sessions for you users with the Alchemy Signer
---

# Manage user sessions

By default the `AlchemySigner` leverages `localStorage` to cache user sessions for 15 minutes. You can optionally configure this by passing in a [`sessionConfig`](/packages/aa-alchemy/signer/overview.html#parameters) to your `AlchemySigner` constructor.

You can check if a session exists by doing the following:
::: code-group

```ts
import { signer } from "./signer";

// NOTE: this method throws if there is no authenticated user
// so we return null in the case of an error
const user = await signer.getAuthDetails().catch(() => null);
```

<<< @/snippets/signers/alchemy/signer.ts
:::

If there is an existing session, then your signer is ready for use! If not, see the section above for logging users in.
