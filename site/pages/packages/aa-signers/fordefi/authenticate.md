---
title: FordefiSigner • authenticate
description: Overview of the authenticate method on FordefiSigner
---

# authenticate

`authenticate` is a method on the `FordefiSigner` which leverages the `Fordefi` provider to authenticate a user.

You must call this method before accessing the other methods available on the `FordefiSigner`, such as signing messages or typed data or accessing user details.

## Usage

```ts [example.ts]
// [!code focus:99]
import { FordefiSigner } from "@alchemy/aa-signers/fordefi";

const fordefiSigner = new FordefiSigner({
  chainId: 11155111,
  address: "0x1234567890123456789012345678901234567890",
  apiUserToken: process.env.FORDEFI_API_USER_TOKEN!,
  apiPayloadSignKey: process.env.FORDEFI_API_PAYLOAD_SIGNING_KEY!,
});

await fordefiSigner.authenticate();
```
