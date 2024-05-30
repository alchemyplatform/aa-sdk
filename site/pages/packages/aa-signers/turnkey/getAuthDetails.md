---
title: TurnkeySigner • getAuthDetails
description: Overview of the getAuthDetails method on TurnkeySigner
---

# getAuthDetails

`getAuthDetails` returns the details about the authenticated user, in accordance with the `Turnkey` SDK's [specifications](https://docs.turnkey.com/api#tag/Sessions/operation/GetWhoami).

This method must be called after [`authenticate`](/packages/aa-signers/turnkey/authenticate). Otherwise, this method will throw an error with the message `Not Authenticated`.

## Usage

:::code-group

```ts [example.ts]
import { createTurnkeySigner } from "./turnkey";
// [!code focus:99]
const turnkeySigner = await createTurnkeySigner();

const details = await turnkeySigner.getAuthDetails();
```

```ts [turnkey.ts]
// [!include ~/snippets/signers/turnkey.ts]
```

:::

## Returns

### `Promise<TurnkeyUserMetadata>`

A `Promise` containing the `TurnkeyUserMetadata`, and object with the following fields:

- `organizationId: string` -- unique identifier for the user's organization.
- `organizationName: string` -- human-readable name for the user's organization.
- `userId: string` -- unique identifier for the user.
- `username: string` -- human-readable name for the user.
