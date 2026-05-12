# Zod Codecs

Use the local Zod schema wrappers for Wallet API RPC encode/decode paths.

## Why

`packages/wallet-apis/src/utils/schema.ts` provides `methodSchema`, `encode`,
and `decode` helpers that extract Zod schemas from RPC method definitions and
wrap validation failures in `@alchemy/common` `BaseError` with useful error
messages. Bypassing these wrappers loses consistent error formatting.

## Good

```ts
const { request, response } = methodSchema(SomeRpcMethodSchema);
const params = encode(request, value);
const result = decode(response, rpcResult);
```

## Bad

Calling `schema.parse()` or `schema.safeParse()` directly in action code and
throwing raw Zod errors to SDK consumers.

## Exceptions

Schema helpers inside `schema.ts` may call Zod directly because they define
the wrapper behavior.
