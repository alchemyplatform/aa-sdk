---
outline: deep
head:
  - - meta
    - property: og:title
      content: Sponsoring Gas
  - - meta
    - name: description
      content: Guide to Sponsor Gas of an account
  - - meta
    - property: og:description
      content: Guide to Sponsor Gas of an account
---

# Sponsoring Gas

Do you find gas fees a challenge for your dApp users? Alchemy's [Gas Manager](https://dashboard.alchemy.com/gas-manager) lets you sponsor gas for specific accounts, offering a seamless experience for your users. This guide walks you through using the Gas Manager to send sponsored user operations from a smart account.

## How to Sponsor Gas: A Step-by-Step Guide

If you've set up a project and installed the necessary packages, follow these steps to sponsor gas for your users:

### 1. Set Up the Provider

Start by creating a provider. You'll use this to send user operations and interact with the blockchain. Here's how to create a provider with `AlchemyProvider`:

<<< @/snippets/provider.ts

Remember to replace `ALCHEMY_API_KEY` with your Alchemy API key. If you don't have one, you can get it from the [Alchemy dashboard](https://dashboard.alchemy.com/).

### 2. Define and Implement the Gas Manager Policy

Gas manager policies are your custom rules that decide when you'll sponsor a user operation. Create a gas policy by visiting the [Gas Manager](https://dashboard.alchemy.com/gas-manager) and clicking the ["Create Policy" button](https://dashboard.alchemy.com/gas-manager/policy/create). After setting up a policy, you can view its policy id on the Gas Manager dashboard. You'll need this id to connect your provider with the Gas Manager.

In the code snippet below, replace `GAS_MANAGER_POLICY_ID` with your policy id. For more insights on gas policies and creating them, refer to the guide on [setting up a gas manager policy](https://docs.alchemy.com/docs/setup-a-gas-manager-policy).

::: code-group

```ts [sponsor-gas.ts]
import { provider } from "./provider.ts";

// Find your Gas Manager policy id at: // [!code focus:10]
//dashboard.alchemy.com/gas-manager/policy/create
const GAS_MANAGER_POLICY_ID = "YourGasManagerPolicyId";

// Link the provider with the Gas Manager. This ensures user operations
// sent with this provider get sponsorship from the Gas Manager.
provider.withAlchemyGasManager({
  policyId: GAS_MANAGER_POLICY_ID,
  entryPoint: entryPointAddress,
});

// Here's how to send a sponsored user operation from your smart account:
const { hash } = await provider.sendUserOperation({
  target: "0xTargetAddress",
  data: "0xCallData",
  value: 0n, // value in bigint or leave undefined
});
```

<<< @/snippets/provider.ts

:::

By following the above, you've created a gas manager policy and linked it to the provider. This guarantees that user operations sent with this provider receive sponsorship.

### 3. Dispatch the Sponsored UserOperation

You're all set to send the user operation! Just call `sendUserOperation` on the provider as usual. Thanks to your earlier setup, the Gas Manager will sponsor this user operation:

::: code-group

```ts [sponsor-gas.ts]
import { provider } from "./provider.ts";

// Your Gas Manager policy id is available at: //
//dashboard.alchemy.com/gas-manager/policy/create
https: const GAS_MANAGER_POLICY_ID = "YourGasManagerPolicyId";

// Link the provider with the Gas Manager so the user operations
// sent with this provider get sponsorship from the Gas Manager.
provider.withAlchemyGasManager({
  policyId: GAS_MANAGER_POLICY_ID,
  entryPoint: entryPointAddress,
});

// Send a sponsored user operation from your smart account like this: // [!code focus:6]
const { hash } = await provider.sendUserOperation({
  target: "0xTargetAddress",
  data: "0xCallData",
  value: 0n, // value in bigint or leave undefined
});
```

<<< @/snippets/provider.ts

:::

Congratulations! You've set up a gas sponsorship using Alchemy's Gas Manager and are now sponsoring user operations seamlessly.
