---
outline: deep
head:
  - - meta
    - property: og:title
      content: LitSigner • constructor
  - - meta
    - name: description
      content: Overview of the constructor method on LitSigner in aa-signers
  - - meta
    - property: og:description
      content: Overview of the constructor method on LitSigner in aa-signers
---

# constructor

## Usage

::: code-group

```ts [example.ts]
new LitSigner<AuthMethod>({
  pkpPublicKey: "PKP_PUBLIC_KEY",
  rpcUrl: "RPC_URL",
  network: "cayenne",
  debug: false,
});
```

or

```ts [example.ts]
new LitSigner<SessionSigMap>({
  pkpPublicKey: "PKP_PUBLIC_KEY",
  rpcUrl: "RPC_URL",
  network: "cayenne",
  debug: false,
});
```

:::

## Returns

A new instance of `LitSigner`

## Parameters

`LitAccountAuthenticatorParams` takes the following arguments:

- `pkpPublicKey: string` -- PKP public key
- `rpcUrl: string` -- rpc context for the chain you wish to connect to
- `network: string` -- [optional] The desired Lit Protocol network to connect to. Defaults to `cayenne` (pkps must be on the network specified)
- `debug: boolean` -- [optional] Enable / disable debug logging. Defaults to `false`
