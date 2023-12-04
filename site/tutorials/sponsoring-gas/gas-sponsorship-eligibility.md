---
outline: deep
head:
  - - meta
    - property: og:title
      content: How to Handle User Operations that are Not Eligible for Gas Sponsorship
  - - meta
    - name: description
      content: Follow this guide to handle User Operations that are not eligible for gas sponsorship. Account Kit is a vertically integrated stack for building apps that support ERC-4337.
  - - meta
    - property: og:description
      content: Follow this guide to handle User Operations that are not eligible for gas sponsorship. Account Kit is a vertically integrated stack for building apps that support ERC-4337.
  - - meta
    - name: twitter:title
      content: How to Handle User Operations that are Not Eligible for Gas Sponsorship
  - - meta
    - name: twitter:description
      content: Follow this guide to handle User Operations that are not eligible for gas sponsorship. Account Kit is a vertically integrated stack for building apps that support ERC-4337.
---

# How to Handle User Operations that are Not Eligible for Gas Sponsorship

As mentioned from the previous guide on [How to Sponsor Gas for a User Operation](./sponsoring-gas.md), with Account Kit can sponsor gas fees for transactions via the [Gas Manager](https://docs.alchemy.com/docs/gas-manager-services).

But what happens when the user operation you are sending fails to satisfy the criteria set in the gas manager policy? How do you check if the user operation is eligible for gas sponsorship before sending the user operation?

If you do send the user operation that is not eligible for the gas sponsorship under your Gas Manager policy, [`sendUserOperation`](/packages/aa-core/provider/sendUserOperation.md) or [`sendTransaction`](/packages/aa-core/provider/sendTransaction.md) will fail due to the error thrown during the [`PaymasterMiddleware`](/packages/aa-core/provider/withPaymasterMiddleware.md) failure. You can follow the guide below to check for gas sponsorship eligibility in advance.

## 1. How to Check if a User Operation is Eligible for Gas Sponsorship

First, you can follow the same instructions from the previous guide on [How to Sponsor Gas for a User Operation](./sponsoring-gas.md) to set up your `SmartAccountProvider` and link your gas policy.

::: code-group

```ts [setup-alchemy-provider.ts]
import { provider } from "./provider.ts";

// Find your Gas Manager policy id at: // [!code focus:10]
//dashboard.alchemy.com/gas-manager/policy/create
const GAS_MANAGER_POLICY_ID = "YourGasManagerPolicyId";

// Link the provider with the Gas Manager. This ensures user operations
// sent with this provider get sponsorship from the Gas Manager.
provider.withAlchemyGasManager({
  policyId: GAS_MANAGER_POLICY_ID,
});
```

<<< @/snippets/provider.ts

:::

Then, before you call `sendUserOperation` on the provider, you can use [`checkGasSponsorshipEligibility`](/packages/aa-core/provider/checkGasSponsorshipEligibility.md) to verify the eligibility of the connected account for gas sponsorship concerning the upcoming `UserOperation` (UO) that is intended to be sent.

Internally, this method invokes [`buildUserOperation`](/packages/aa-core/provider/buildUserOperation.md), which navigates through the middleware pipeline, including the `PaymasterMiddleware`. Its purpose is to construct the UO struct meant for transmission to the bundler. Following the construction of the UO struct, this function verifies if the resulting structure contains a non-empty `paymasterAndData` field.

You can utilize this method before sending the user operation to confirm its eligibility for gas sponsorship. Depending on the outcome, it allows you to tailor the user experience accordingly, based on eligibility.

```ts [check-gas-sponsorship-eligibility.ts]
const elligibility = await provider.checkGasSponsorshipEligibility({
  target: "0xTargetAddress",
  data: "0xCallData",
  value: 0n, // value in bigint or leave undefined
});

console.log(
  `User Operation is ${
    eligible ? "eligible" : "ineligible"
  } for gas sponsorship`
);
```

## 2. How to Bypass the Paymaster Middleware For User Operations Not Eligible for Gas Sponsorship

If you attempt to execute the `sendUserOperation` method for user operations ineligible for gas sponsorship through the configured provider with the gas manager policy, an error will be thrown. This error would prevent users from sending the user operation. In such cases, the desired user experience involves allowing these users, despite the lack of gas sponsorship eligibility, to still send the user operation by reverting to the default behavior of paying gas fees from the user's account balance. For instance, your application could inform users about their gas sponsorship eligibility status, surface the eligibility of the user operation, and provide users with the choice to unblock themselves by sending the user operation without gas sponsorship.

This section of the guide elucidates how you can circumvent the `PaymasterMiddleware`, enabling the sending of user operations without gas sponsorship. This functionality permits the sending of user operations where users pay the gas fee themselves via their smart account.

When employing various methods on `SmartAccountProvider` to send user operations (e.g., [`sendUserOperation`](/packages/aa-core/provider/sendUserOperation.md) or [`sendTransaction`](/packages/aa-core/provider/sendTransaction.md)), apart from the `UserOperationCallData` or `BatchUserOperationCallData`, you have the option to include an additional parameter named `overrides`. This parameter allows the specification of override values for `maxFeePerGas`, `maxPriorityFeePerGas`, `callGasLimit`, `preVerificationGas`, `verificationGasLimit` or `paymasterAndData`. To bypass the `PaymasterMiddleware`, you can specifically set the `paymasterAndData` override. For example, assigning an empty hex string (`0x`) to the `paymasterAndData` field in the overrides would result in the user operation being sent without the paymaster covering the gas fee, but rather paid from the user's own smart account.

```ts [bypass-paymaster-middleware.ts]
// If gas sponsorship ineligible, baypass paymaster middleware by passing in the paymasterAndData override

// Empty paymasterAndData indicates that there will be no paymaster involved
// and the user will be paying for the gas fee even when `withAlchemyGasManager` is configured on the provider

const elligibility = await provider.checkGasSponsorshipEligibility({
  target: "0xTargetAddress",
  data: "0xCallData",
  value: 0n, // value in bigint or leave undefined
});

// if `elligibility` === false, inform users about their ineligibility,
// either notifying or asking for consent to proceed with gas fee being paid from their account balance

// To proceed with bypassing the paymster middleware
const overrides = { paymasterAndData: "0x" };

const userOperationResult = await provider.sendUserOperation(
  {
    target: "0xTargetAddress",
    data: "0xCallData",
  },
  overrides: elligibility ? undefined : overrides // for ineligible user operations, set the paymasterAndData override
);

const txHash = await provider.waitForUserOperationTransaction({
  hash: userOperationResult.hash,
});
```

That's it! By using the above methods, you can provide the desired user experience for your users depending on their eligibility for gas sponsorship.

1. Check for the gas sponsorship eligibility prior to sending the user operation and inform users about their gas sponsorship eligibility status.
2. Provide users with the choice to unblock themselves by sending the user operation without gas sponsorship.
3. Still send the user operation by reverting to the default behavior of paying gas fees from the user's account balance by bypassing the paymster middleware for the ineligible user operations.

Account Kit provides much flexibility for you to design optimal user experiences to handle different cases of gas sponsonship eligibility accordingly.
