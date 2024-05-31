---
title: Split Transport
description: Learn how to use a different RPC provider for your bundler traffic
  and node traffic
---

# split

The split transport allows you to provide overrides for specific RPC methods. This is useful, for example, if you want to send bundler traffic to one provider and node traffic to another.

## Import

```ts
import { split } from "@alchemy/aa-core";
```

## Usage

```ts [splitTransport.ts]
// [!include ~/snippets/aa-core/splitTransport.ts]
```

## Parameters

```ts
import { type SplitTransportProps } from "@alchemy/aa-core";
```

### overrides

`{transport: Transport, methods: string[]}[]`

The overrides param is an array of objects containing a `transport` param of type `Transport` from viem (eg. `http`) and an array of `methods` that this transport should handle

### fallback

`Transport`

This is the `Transport` to use for all other methods

## Return Type

```ts
import { type CustomTransport } from "viem";
```

Returns a `CustomTransport` that can be passed to any compatible `viem` Client. This includes any `SmartAccountClient` instance.
