---
title: Modular Account with Multisig Plugin • Getting started
description: Getting started with the Modular Account with Multisig Plugin in Account Kit
---

# Getting started with the Multisig Plugin

## 1. Create a Multisig Account Client

Initialize a Multisig Modular Account client and set the `n` accounts as signers.

:::warning
It is recommended to use the `createMultisigAccountAlchemyClient` directly to create new accounts with multi-sig ownership, rather than extending the Modular Account client.

If you have an existing Modular Account (which has multi-owner plugin by default), please see details [here](/extending-smart-accounts/install-plugins#extend-modular-account-with-multisig) for installing the plugin before proceeding.
:::

```ts
import { LocalAccountSigner } from "@alchemy/aa-core";
import { createMultisigAccountAlchemyClient } from "@account-kit/infra";

// Creating a 3/3 multisig account
const signers = [LocalAccountSigner.mnemonicToAccountSigner(
    MODULAR_MULTISIG_ACCOUNT_OWNER_MNEMONIC,
    { accountIndex: 0 }
  ), LocalAccountSigner.mnemonicToAccountSigner(
    MODULAR_MULTISIG_ACCOUNT_OWNER_MNEMONIC,
    { accountIndex: 1 }
  ), LocalAccountSigner.mnemonicToAccountSigner(
    MODULAR_MULTISIG_ACCOUNT_OWNER_MNEMONIC,
    { accountIndex: 2 }
  )];

const threshold = 3n;

const owners = await Promise.all(
  signers.map((s) => s.getAddress()),
);

const multisigAccountClient = createMultisigAccountAlchemyClient({
    chain,
    signers[0],
    owners,
    threshold,
    apiKey: "YOUR_API_KEY",
  });
```

## 3. Propose a User Operation

To propose a new user operation for review by the multisig signers, you will use the `proposeUserOperation` method. This estimates gas, constructs the user operation struct, and if `gasManagerConfig` is used then it attempts to use a paymaster. Lastly, a signature is generated with the pre-provided signer.

```ts
import { createMultisigAccountAlchemyClient } from "@account-kit/infra";

const multisigAccountClient = createMultisigAccountAlchemyClient({
    chain,
    signers[0],  // using the first signer
    owners,
    threshold,
    apiKey: "YOUR_API_KEY",
    gasManagerConfig: {
      policyId: PAYMASTER_POLICY_ID,
    }
  });

const { request, aggregatedSignature, signatureObj: firstSig } = await multisigAccountClient.proposeUserOperation({
    uo: {
      target: targetAddress,
      data: "0x",
    }
  });
```

## 4. Get the threshold signatures

Next, you have to collect the next k-2 signatures, excluding the first signature which you already provided and the last signature which we'll deal with in step 5 when we send the user operation. Each member of the multisig can sign with the `signMultisigUserOperation` method.

```ts
import { createMultisigAccountAlchemyClient } from "@account-kit/infra";

const multisigAccountClient = createMultisigAccountAlchemyClient({
    chain,
    signers[1], // using the second signer
    owners,
    threshold,
    apiKey: "YOUR_API_KEY",
  });

const { aggregatedSignature, signatureObj: secondSig } = await multisigAccountClient.signMultisigUserOperation({
  account: multisigAccountClient.account,
  signatures: [previousAggregatedSignature], // output from step 1, and from this step if k-2 > 1
  userOperationRequest: request,
});
```

## 5. Send the User Operation

After collecting k-1 signatures, you're ready to collect the last signature and send the user operation. This is done with the `sendUserOperation` method. `sendUserOperation` also formats this aggregated signature, sorting its parts in ascending order by owner address as expected by the Multisig Plugin smart contract.

```ts
import { createMultisigAccountAlchemyClient } from "@account-kit/infra";

const multisigAccountClient = createMultisigAccountAlchemyClient({
    chain,
    signers[2], // using the last signer
    owners,
    threshold,
    apiKey: "YOUR_API_KEY",
  });

const result = await multisigAccountClient.sendUserOperation({
  uo: request.callData,
  context: {
    aggregatedSignature,
    signatures: [firstSig, secondSig],
    userOpSignatureType: "ACTUAL"
  }
});
```

By default, we use the variable gas feature in the Multisig Plugin smart contract. For this, we need `userOpSignatureType` to be set to "ACTUAL". If you do not wish to use this feature, gas overrides should be passed in `sendUserOperation`, and `userOpSignatureType` should be set to "UPPERLIMIT".

```ts
const result = await multisigAccountClient.sendUserOperation({
  uo: request.callData,
  overrides: {
    callGasLimit: request.callGasLimit,
    verificationGasLimit: request.verificationGasLimit,
    preVerificationGas: request.preVerificationGas,
    maxFeePerGas: request.maxFeePerGas,
    maxPriorityFeePerGas: request.maxPriorityFeePerGas,
  },
  context: {
    aggregatedSignature,
    signatures: [firstSig, secondSig],
    userOpSignatureType: "UPPERLIMIT",
  },
});
```

## Conclusion

That's it! You've initialized a modular account with three multisig members, proposed a user operation, collected the necessary signatures, and sent the user operation to the bundler.

For more info, check out the [technical details](./technical-details) of the multisig plugin.
