# TypeBox Codecs

Use the local TypeBox codec wrappers for Wallet API RPC encode/decode paths.

## Why

`packages/wallet-apis/src/utils/schema.ts` converts TypeBox `EncodeError` and
`DecodeError` into SDK `BaseError` messages with useful paths and schema error
messages. Bypassing it loses consistent error formatting.

## Good

```ts
const params = encode(schema, value);
const response = decode(schema, rpcResult);
```

## Bad

Calling `Value.Encode` or `Value.Decode` directly in action code and throwing
raw TypeBox errors to SDK consumers.

## Exceptions

Schema helpers inside `schema.ts` may call TypeBox directly because they define
the wrapper behavior.
