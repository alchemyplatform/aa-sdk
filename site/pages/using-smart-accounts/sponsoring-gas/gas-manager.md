---
title: How to sponsor gas for a UserOperation
description: Follow this guide to sponsor gas for UserOperations from any
  ERC-4337 smart account. Account Kit is a vertically integrated stack for
  building apps that support ERC-4337.
---

# How to sponsor gas for a UserOperation

Gas fees are a significant barrier to entry for new user of your app. With Account Kit you can remove this barrier by sponsoring gas fees for transactions via the [Gas Manager](https://docs.alchemy.com/docs/gas-manager-services/?a=ak-docs). This guide explains how to sponsor gas by creating a gas policy, linking it to your client, and sending sponsored `UserOperations` (UOs) from a smart account.

## How to sponsor gas

After [installing `aa-sdk`](/getting-started/introduction) in your project, follow these steps to sponsor gas.

### 1. Create a Gas Manager policy

A gas manager policy is a set of rules that define which UOs are eligible for gas sponsorship. You can control which operations are eligible for sponsorship by defining rules:

- **Spending rules**: limit the amount of money or the number of user ops that can be sponsored by this policy
- **Allowlist**: restrict wallet addresses that are eligible for sponsorship. The policy will only sponsor gas for UOs that were sent by addresses on this list.
- **Blocklist**: ban certain addresses from receiving sponsorship under this policy
- **Policy duration**: define the duration of your policy and the sponsorship expiry period. This is the period for which the Gas Manager signature (paymaster data) will remain valid once it is generated.

To learn more about policy configuration, refer to the guide on [setting up a gas manager policy](https://docs.alchemy.com/docs/setup-a-gas-manager-policy/?a=ak-docs).

Once you have decided on policy rules for your app, [create a policy](https://dashboard.alchemy.com/gas-manager/policy/create/?a=ak-docs) in the Gas Manager dashboard.

### 2. Create an `AlchemySmartAccountClient` that uses your policy

Remember to replace `ALCHEMY_API_KEY` with your Alchemy API key. If you don't have one yet, you can create an API key on the [Alchemy dashboard](https://dashboard.alchemy.com/signup/?a=aa-docs).

![Policy ID](/images/policy-id.png)

Copy it and then replace the `GAS_MANAGER_POLICY_ID` in the snippet below.

```ts [gas-manager-client.ts]
// [!include ~/snippets/aa-alchemy/gas-manager-client.ts]
```

You have created a gas manager policy and linked it to the client. This guarantees that UOs sent with this client receive sponsorship if and only the UO satisfies the rules defined in your gas policy.

### 4. Send the sponsored UserOperation

Now you are ready to send sponsored UOs! You can send a UO by calling `sendUserOperation` on the client. The Gas Manager will check if this UO satisfies the policy rules defined above and sponsor the gas costs if the rules are met. If the UO does not meet the policy rules, an error will be thrown.

:::code-group

```ts [sponsor-gas.ts]
import { smartAccountClient } from "./smartAccountClient.ts";

// Send a sponsored UO from your smart account like this: // [!code focus:6]
const { hash } = await smartAccountClient.sendUserOperation({
  target: "0xTargetAddress",
  data: "0xCallData",
  value: 0n, // value in bigint or leave undefined
});
```

```ts [gas-manager-client.ts]
// [!include ~/snippets/aa-alchemy/gas-manager-client.ts]
```

:::

Congratulations! You have successfully sponsored gas for a UO by creating a Gas Manager Policy, defining policy rules, linking your policy to the client, and submitting a UO.
