---
outline: deep
head:
  - - meta
    - property: og:title
      content: Send a userop
  - - meta
    - name: description
      content: Setup guide to send a userop using a custom account with aa-sdk.
  - - meta
    - property: og:description
      content: Setup guide to send a userop using a custom account with aa-sdk.
  - - meta
    - name: twitter:title
      content: Send a userop
  - - meta
    - name: twitter:description
      content: Setup guide to send a userop using a custom account with aa-sdk.
---

# Send a User Operation

In the last step, we setup our project using the `aa-sdk` and Alchemy. Now, we'll leverage a `LocalAccountSigner` to send a userop.

## 1. Query the account address

Before we can send a userop, we need to query the smart account address we'll be using and send it some ETH (later we can leverage the [Gas Manager](/using-smart-accounts/sponsoring-gas/gas-manager) to sponsor the gas).

<<< @/snippets/getting-started/client.ts

Copy the above into `index.ts`. To run the script, do the following:

```bash
npx tsx index.ts
```

You will get a response like this in your terminal:

```
Smart Account Address: 0xYOUR_SMART_ACCOUNT_ADDRESS
```

## 2. Fund your account

At scale, you can use our Gas Manager to [sponsor User Operations](/using-smart-accounts/sponsoring-gas/gas-manager) for smart accounts so the user doesn't need to fund their account.

But for this quickstart guide, and because we are developing on a testnet, let's fund the account using the [Alchemy Faucet](https://sepoliafaucet.com). Simply log in with Alchemy and claim your testnet tokens for free, using your smart account's address from above.

<img src="/images/alchemy-faucet.png" width="auto" height="auto" alt="Account Kit Overview" style="display: block; margin: auto;">

## 3. Send a User Operation using Account Kit

Finally, deploy the newly funded smart account and send a UO on its behalf.

<<< @/snippets/getting-started/send-user-operation.ts

Copy the above to replace what's in `index.ts`. To run the full example script above, do:

```bash
npx tsx index.ts
```

And that's it! You should see the following on your terminal:

```
Smart Account Address: 0xYOUR_SMART_ACCOUNT_ADDRESS
UserOperation Hash: 0xYOUR_UO_HASH
Transaction Hash: 0xYOUR_TXN_HASH
```

:::tip Note
The UO hash is what our [Bundler](https://github.com/alchemyplatform/rundler) returns once it submits the UO to the Blockchain on behalf of your smart account.
You will want to use the `Transaction Hash` to know when the UO is mined on a blockchain to query information about it.
:::

:::tip Handling Errors
When running the above script, you might see the following errors:

1. "precheck failed: maxFeePerGas is XXX but must be at least XXX, which is based on the current block base fee."
2. "precheck failed: sender balance and deposit together is XXX but must be at least XXX to pay for this operation."
3. "Failed to find transaction for User Operation."

These are due to increased network activity at that time and are fleeting issues. Running the script again will resolve them naturally.
:::
