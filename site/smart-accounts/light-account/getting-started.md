---
outline: deep
head:
  - - meta
    - property: og:title
      content: Light Account • Getting Started
  - - meta
    - name: description
      content: Follow this guide to use Light Account with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
  - - meta
    - property: og:description
      content: Follow this guide to use Light Account with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
  - - meta
    - name: twitter:title
      content: Light Account
  - - meta
    - name: twitter:description
      content: Follow this guide to use Light Account with Account Kit, a vertically integrated stack for building apps that support ERC-4337.
---

# Getting started

Getting started with Light Account is really simple! Simply create a `SmartAccountClient` and an instance of `LightAccount` and you're ready to go.

## Import

::: code-group

```ts [aa-alchemy]
import { createLightAccountAlchemyClient } from "@alchemy/aa-alchemy";
```

```ts [aa-core]
import { createLightAccount } from "@alchemy/aa-accounts";
import { createSmartAccountClient } from "@alchemy/aa-core";
```

:::

## Usage

The code snippet below demonstrates how to use Light Account with Account Kit. It creates a Light Account and sends a `UserOperation` from it:
::: code-group

<<< @/snippets/aa-alchemy/light-account.ts [aa-alchemy]

<<< @/snippets/aa-core/smartAccountClient.ts [aa-core]

::: code-group
