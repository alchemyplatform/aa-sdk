---
title: Frequently Asked Questions
description: Learn how to get started with Alchemy's Account Kit, a vertically
  integrated stack for building apps that support ERC-4337 and ERC-6900.
---

# Frequently asked questions

## Smart Accounts - Light Account

### Do accounts have the same address across all chains?

:::details[Answer]
In almost all cases, yes, you will get the same address on all chains as long as the connecting signer address is the same! The deployment address is a function of the address of owner/signer address, the account implementation (e.g. latest version of Light Account), and the salt (you can optionally specify this). If all three of those remain the same, then you deploy the smart account at the same contract address.

There are two scenarios where you would get a different contract address:

1. If you deploy one smart account, then change the signer, then deploy the second account.
2. If you upgrade the smart account (e.g. to a new version of Light Account). It is unlikely that we will make many updates to this contract so the address will not change frequently.
   :::

### How does a smart account get deployed?

:::details[Answer]
Your smart account will be deployed when the first `UserOperation` (UO) is sent from the account. The first UO must be sent with a non-zero `initCode`. aa-sdk will handle generation of this `initCode` for you using [`getAccountInitCode`](/packages/aa-core/accounts/).
:::

### How can I upgrade a Light Account?

:::details[Answer]
It is unlikely you will need to frequently update the Light Account contract itself, however it is possible if needed. Light Account has [`UUPSUpgradeable`](https://github.com/alchemyplatform/light-account/blob/main/src/LightAccount.sol#L50) which adds upgrade methods on the account itself. To upgrade an account you will need to send a `UserOperation` using the method `upgradeTo` or `upgradeToAndCall`, depending on whether or not you need to initialize the new implementation.
:::

### Can I have multiple accounts for the same signer address? / How do I set the value of the salt for Light Account?

:::details[Answer]
Yes! The optional salt value on Light Account enables the ability to have multiple accounts under a single signer. This value defaults to 0. You can set it when you create [light account](/packages/aa-accounts/light-account/).
:::

### How can I upgrade from Simple Account to Light Account?

:::details[Answer]
[Simple Account's](https://github.com/eth-infinitism/account-abstraction/blob/develop/contracts/samples/SimpleAccount.sol) support [`upgradeToAndCall`](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/4e7e6e54daedf091d91f2f2df024cbb8f253e2ef/contracts/proxy/utils/UUPSUpgradeable.sol#L86) implemented by openzeppelin [UUPSUpgradeable](https://docs.openzeppelin.com/contracts/4.x/api/proxy#UUPSUpgradeable) contract. This allows you to upgrade from Simple Account to Light Account without changing the smart contract account address. Using `upgradeToAndCall` will update the underlying implementation contract on the account while the account address and assets will stay the same.

You can call `upgradeToAndCall` on the Simple Account with these params:

- `newImplementation`: Latest LightAccount implementation address (found [here](https://github.com/alchemyplatform/light-account/blob/main/Deployments.md#lightaccount) - make sure to use the implementation address, not the factory address)
  - For example LightAccount v1.1.0 - 0xae8c656ad28F2B59a196AB61815C16A0AE1c3cba
- `data`: encoded version of the `initialize` function with `anOwner` parameter set to the owner on the account, usually the same owner as what the account used as Simple Account.
  - In solidity (foundry) you can use abi.encodeCall and in viem you can use [encodeFunctionData](https://github.com/alchemyplatform/light-account/blob/main/Deployments.md#lightaccount)

It is very important that the `initialize` step is encoded correctly to ensure the account does not get into a risky state where someone else could call initialize on it with one's signer and take control of your account. You can call `owner()` on the account after the upgrade to ensure it is assigned correctly.

This can be called on the existing smart contract account by sending a user operation that calls `execute` (or `executeBatch`) and has that call `upgradeToAndCall` (the same way you would make the account send calls to other addresses).
:::

## Submitting `UserOperation`s

### How does the speed of `UserOperation`s compare to normal transactions?

:::details[Answer]
If the `UserOperation` (meta-transaction for 4337 accounts) is correctly priced and submitted a few hundred milliseconds prior to a new block getting created, it will typically get placed in the next block. This is because the Bundler needs time to create/propagate its transaction. You can think of it as 1 extra block time worth of latency, but we are working towards improving this latency.
:::

### Why am I seeing a delay in landing `UserOperation`s on-chain?

:::details[Answer]
This can happen when `UserOperation`s (UOs) become underpriced, frequently due to fee market movement between when gas and fees are estimations and when the UO is actually submitted.

You may experience this when calling the [`waitForUserOperationTransaction`](/packages/aa-core/smart-account-client/actions/waitForUserOperationTransaction#waitForUserOperationTransaction) method. It may throw an error if it does not find the UO in a mined Transaction within its retry limits.

You can mitigate this by defining a more flexible retry period when constructing a [`Client`](/packages/aa-core/smart-account-client/index#usage) (i.e. `txMaxRetries`, `txRetryIntervalMs`, `txRetryMultiplier` in `opts`). If your UO continues to be delayed beyond a limit you are willing to wait, you can resubmit it using [`dropAndReplaceUserOperation`](/packages/aa-core/smart-account-client/actions/dropAndReplaceUserOperation#dropandreplaceuseroperation).
:::

### Are `UserOperation`s protected from MEV bots?

:::details[Answer]
Right now, `UserOperation`s are sent to a private mempool for all networks other than Polygon, where there is no way to do this. We are actively involved in proposals for a peer-to-peer mempool standard.
:::

### Can I simulate `UserOperation`s the same way I simulate transactions?

:::details[Answer]
Yes! Check out [this guide](/using-smart-accounts/simulate-user-operations).
:::

## Gas Estimation

### How does gas estimation for 4337 smart contract accounts work?

:::details[Answer]
Our bundler estimates gas and submits `UserOperation`s (UOs) under the hood of the aa-sdk. Our gas estimations are just that, estimations that optimize for UOs landing on chain, and you may need to adjust gas limits based on your needs using [overrides](/packages/aa-core/smart-account-client/types/userOperationOverrides).

Learn more about gas estimation and how it is implemented in our [Bundler](https://www.alchemy.com/blog/erc-4337-gas-estimation).

There are many nuances and edge cases that our bundler considers especially for L2’s. Learn more [here](https://www.alchemy.com/blog/l2-gas-and-signature-aggregators).

We recommend adding error handling when sending a UO to handle potential gas and fee changes due to market movement. Learn more about [frequent errors](#common-errors).
:::

## Gas Manager

### What tiers support gas sponsorship?

:::details[Answer]
Gas sponsorship is available on testnet for all tiers. For support on mainnet, you must be on a paying tier (i.e. Growth tier and above). Learn more about our different pricing tiers [here](https://docs.alchemy.com/reference/gas-manager-coverage-api-pricing#fee-logic).
:::

### How is gas sponsored? Do I need to fund the Gas Manager?

:::details[Answer]
We front the gas for your application and put the USD equivalent on your bill at the end of the month. No need to worry about pre-funding the Gas Manager or conversions, we’ve got you covered! You can follow [this guide](/using-smart-accounts/sponsoring-gas/gas-manager) for more details on how to sponsor `UserOperation`s.
:::

### What are my gas sponsorship limits?

:::details[Answer]
You can find details of Gas Manager limits depending on your tier [here](https://docs.alchemy.com/reference/gas-manager-coverage-api-pricing#fee-logic).
:::

### Do you support ERC-20 or stablecoin paymasters?

:::details[Answer]
Currently, we don’t support this, but we are actively exploring. Please [reach out](/resources/contact-us) if you are interested as we would love your input in our spec.
:::

### How is the Gas Manager protected from DDOS attacks?

:::details[Answer]
In your Gas Manager policy, you can configure spending rules per address, per app, and/or policy wide limits. See how to set up these policies [here](/using-smart-accounts/sponsoring-gas/gas-manager#_2-create-a-gas-manager-policy).
:::

## Common Errors {#common-errors}

### Invalid policy ID: `{ code: -32602, message: 'Invalid Policy ID' }`

:::details[Answer]
Gas Manager policies can only be tied to one app. Make sure you are using the API Key that is associated with the app the Gas Manager policy is configured for, or create a new policy for the app you are using.
:::

### Precheck failed: `{ code: -3200, message: 'precheck failed: ...' }`

:::details[Answer]
Precheck failed errors are often related to gas and/or fees. Our Bundler follows standard [ERC 4337](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-4337.md#client-behavior-upon-receiving-a-useroperation) implementation for gas and fee checks in order to 1) ensure your `UserOperation`s (UOs) land on chain and to 2) protect the Bundler from potential attacks in order to support scalability.

These errors are often related to market movement between the time when gas and fees are estimated and the time when UOs are submitted to the bundler. This fluctuation in the market is especially variant on testnet. To ensure your UO is included in a block, we currently reject sending any UOs that are underpriced compared to the network rate .

To handle these errors, we recommend you use our [override fields](/packages/aa-core/smart-account-client/types/userOperationOverrides) to increase buffers on top of our estimates and implement retry mechanisms as needed.

Our gas and fee estimations are just that, estimations, but we are always working to improve these estimates!
:::

### Total execution gas limit exceeded: `{ code: -3202, message: 'precheck failed: total execution gas is X but must be at most 10000000}`

:::details[Answer]
Currently our Bundler allows max 10M gas in aggregate between `preVerificationGas`, `verificationGasLimit`, and `callGasLimit`. To reduce the gas needed, try reducing the size of your call data and/or sending your call data in multiple `UserOperation`s rather than one.
:::

### `waitForUserOperationTransaction` timeout

:::details[Answer]
[`waitForUserOperationTransaction`](/packages/aa-core/smart-account-client/actions/waitForUserOperationTransaction) may throw this error if it does not find the mined User Operation within its retry limits.

You can mitigate this by defining a more flexible retry period when constructing a [`Client`](/packages/aa-core/smart-account-client/index#usage) (i.e. `txMaxRetries`, `txRetryIntervalMs`, `txRetryMultiplier` in `opts`).

If your `UserOperation` continues to be delayed beyond a limit you are willing to wait, you can resubmit the user operation using [`dropAndReplaceUserOperation`](/packages/aa-core/smart-account-client/actions/dropAndReplaceUserOperation#usage).
:::

## Other Support

### Does the aa-sdk repo support React Native?

No, the `aa-sdk` repo does not offically support React Native. **It is on our radar!**

Currently we have a strong dependency on Viem, which requires several global features, such as `TextEncoder` and `crypto`, that are absent in React Native's environment. See more about [Viem's capability here](https://viem.sh/docs/compatibility).

However, we have created a small PoC using Expo that you can find [here](https://github.com/alchemyplatform/aa-sdk-rn-expo/tree/main). For more information on how to use Account Kit within a React Native application see [the guide](/resources/react-native).
