---
title: Modular Account • Upgrading to a Modular Account using Account Kit
description: Upgrading to a Modular Account using Account Kit
---

# Upgrading to a Modular Account

Upgrading a `SmartContractAccount` can be done easily using Account Kit. It just involves a simple call to a single function on the `SmartAccountClient`, namely `upgradeAccount`, along with the necessary call data, `UpgradeToData`, for the account targeted for the upgrade. For upgrading to a Modular Account, you can use the utility function `getMSCAUpgradeToData` provided by the `@alchemy/aa-accounts` package to retrieve the call data for the upgrade. This process applies to any account with upgrade capabilities.

Using the Light Account as an example, here is an overview of how the upgrade can be executed using a Smart Account Client:

:::code-group

```ts [example.ts]
import { smartAccountClient as lightAccountClient } from "./lightAccountClient";
import { getMSCAUpgradeToData } from "@alchemy/aa-accounts";

const { createMAAccount, ...upgradeToData } = await getMSCAUpgradeToData(
  lightAccountClient,
  { account: lightAccountClient.account }
);

const hash = await lightAccountClient.upgradeAccount({
  upgradeTo: upgradeToData,
  waitForTx: true,
});

const upgradedAccount = await createMAAccount();
```

```ts [lightAccountClient.ts]
// [!include ~/snippets/aa-alchemy/light-account-client.ts]
```

:::

That is all! Now, you can create a smart account client to connect with the upgraded account as a Modular Account.

```ts [example.ts]
import { createAlchemySmartAccountClient } from "@alchemy/aa-alchemy";
import { multiOwnerPluginActions } from "@alchemy/aa-accounts";

const upgradedAccountClient = await createAlchemySmartAccountClient({
  apiKey: "YOUR_API_KEY",
  chain: lightAccountClient.chain,
  account: upgradedAccount,
}).extend(multiOwnerPluginActions);

const owners = await upgradedAccountClient.readOwners();
```
