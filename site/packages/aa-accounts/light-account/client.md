---
outline: deep
head:
  - - meta
    - property: og:title
      content: aa-accounts • LightAccountClient
  - - meta
    - name: description
      content: Overview of the LightAccountClient in aa-accounts
  - - meta
    - property: og:description
      content: Overview of the LightAccountClient in aa-accounts
---

# createLightAccountClient

`createLightAccountClient` is a factory that improves the developer experience of connecting a Light Account to a `SmartAccountClient`. You can use this to directly instantiate a `SmartAccountClient` already connected to a Light Account in one line of code.

## Usage

::: code-group

<<< @/snippets/aa-accounts/lightAccountClient.ts
:::

## Returns

### `Promise<SmartAccountClient>`

A Promise containing a new `SmartAccountClient` connected to a Light Account.

## Parameters

### `config: CreateLightAccountClientParams`

- `transport: Transport` -- a Viem [Transport](https://viem.sh/docs/glossary/types#transport) for interacting with JSON RPC methods.

- `chain: Chain` -- the chain on which to create the client.

- `...accountParams`: CreateLightAccountParams -- additional parameters to pass to the [`createLightAccount`](/packages/aa-accounts/light-account/#createlightaccount).

- `...clientParams` -- [optional] additional parameters to pass to the [`SmartAccountClient`](/packages/aa-core/smart-account-client/) constructor.
