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
prev:
  text: Integrating a Signer
  link: /smart-accounts/signers/overview
---

# Sponsoring Gas

Gas fees are a significant barrier to entry for new user of your app. With Account Kit you can remove this barrier by sponsoring gas fees for transactions via the [Gas Manager](https://docs.alchemy.com/docs/gas-manager-services). This guide explains how to sponsor gas by creating a gas policy, linking it to your provider, and sending sponsored user operations from a smart account.

## How to Sponsor Gas

After [installing `aa-sdk`](/getting-started#install-the-packages) in your project, follow these steps to sponsor gas.

### 1. Set Up the Provider

First, create an `AlchemyProvider`. You'll use this to send user operations and interact with the blockchain.

<<< @/snippets/provider.ts

Remember to replace `ALCHEMY_API_KEY` with your Alchemy API key. If you don't have one yet, you can create an API key on the [Alchemy dashboard](https://dashboard.alchemy.com/).

### 2. Create a Gas Manager Policy

A gas manager policy is a set of rules that define which user operations are eligible for gas sponsorship. You can control which operations are eligible for sponsorship by defining rules:

- **Spending rules**: limit the amount of money or the number of user ops that can be sponsored by this policy
- **Allowlist**: restrict wallet addresses that are eligible for sponsorship. The policy will only sponsor gas for user operations that were sent by addresses on this list.
- **Blocklist**: ban certain addresses from receiving sponsorship under this policy
- **Policy duration**: define the duration of your policy and the sponsorship expiry period. This is the period for which the Gas Manager signature (paymaster data) will remain valid once it is generated.

To learn more about policy configuration, refer to the guide on [setting up a gas manager policy](https://docs.alchemy.com/docs/setup-a-gas-manager-policy).

Once you've decided on policy rules for your app, [create a policy](https://dashboard.alchemy.com/gas-manager/policy/create) in the Gas Manager dashboard.

### 3. Link the Policy to your Provider

Next, you must link your gas policy to your provider. Find your Policy ID located at the top of the policy page in the Gas Manager dashboard.

![Policy ID](/images/policy-id.png)

Copy it and then replace the `GAS_MANAGER_POLICY_ID` in the snippet below.

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

You've created a gas manager policy and linked it to the provider. This guarantees that user operations sent with this provider receive sponsorship if and only the user operation satisfies the rules defined in your gas policy.

### 4. Send the Sponsored UserOperation

Now you're ready to send sponsored user operations! You can send a user operation by calling `sendUserOperation` on the provider. The Gas Manager will check if this user operation satisfies the policy rules defined above and sponsor the gas costs if the rules are met. If the user operation does not meet the policy rules, an error will be thrown.

::: code-group

```ts [sponsor-gas.ts]
import { provider } from "./provider.ts";

// Your Gas Manager policy id is available at: //
//dashboard.alchemy.com/gas-manager/policy/create
const GAS_MANAGER_POLICY_ID = "YourGasManagerPolicyId";

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

Congratulations! You've successfully sponsored gas for a user operation by creating a Gas Manager Policy, defining policy rules, linking your policy to the provider, and submitting a user operation.
