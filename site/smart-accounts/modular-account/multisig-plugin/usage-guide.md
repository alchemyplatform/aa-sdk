---
outline: deep
head:
  - - meta
    - property: og:title
      content: Modular Account with Multisig Plugin • Getting started
  - - meta
    - name: description
      content: Getting started with the Modular Account with Multisig Plugin in Account Kit
  - - meta
    - property: og:description
      content: Getting started with the Modular Account with Multisig Plugin in Account Kit
  - - meta
    - name: twitter:title
      content: Modular Account with Multisig Plugin • Getting started
  - - meta
    - name: twitter:description
      content: Getting started with the Modular Account with Multisig Plugin in Account Kit
---

# Getting started with Modular Account with Multisig Plugin

To start, follow the guide to set up Modular Account [here](../getting-started.md).

## Modular Account with Multisig Plugin Actions

### Creating a Account Client

The first step is to create a Multisig Modular Account client 

```ts
import { LocalAccountSigner } from "@alchemy/aa-core";
import { createMultisigAccountAlchemyClient } from "@alchemy/aa-alchemy";

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

const owners = signers.map(async(s) => await s.getAddress())

const multisigAccountClient = createMultisigAccountAlchemyClient({
    chain,
    signers[0], 
    owners,
    threshold,
    apiKey: "YOUR_API_KEY",
  });
```

### Proposing a User Operation

The first step to creating and sending a multisig User Operation is the propose step. This performs gas estimates, constructs the user operation struct, and generates a signature using the pre-provided signer.

```ts
import { createMultisigAccountAlchemyClient } from "@alchemy/aa-alchemy";

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

const { request, aggregatedSignature } = await multisigAccountClient.proposeUserOperation({
    uo: {
      target: targetAddress,
      data: "0x",
    }
  });
```

### Getting the next signatures

The next step is to collect the next k-2 signatures (excluding the first and the last signature). This is done with the `signMultisigUserOperation` method.

```ts
import { createMultisigAccountAlchemyClient } from "@alchemy/aa-alchemy";

const multisigAccountClient = createMultisigAccountAlchemyClient({
    chain,
    signers[1], // using the second signer
    owners,
    threshold,
    apiKey: "YOUR_API_KEY",
  });

const { aggregatedSignature } = await multisigAccountClient.signMultisigUserOperation({
  account: multisigAccountClient.account,
  signatures: [previousAggregatedSignature], // output from step 1, and from this step if k-2 > 1
  userOperationRequest: request,
});
```

### Sending the User Operation

After collecting k-1 signatures, it's time to collect the last signature and send the user operation. This is done with the `sendUserOperation` method. `sendUserOperation` also formats the aggregated signature, sorting them in ascending order of owner address as it's expected by the Multisig Plugin smart contract. Lastly, by default, we reperform gas estimation and use the variable gas feature provided by the Multisig Plugin smart contract.

```ts
import { createMultisigAccountAlchemyClient } from "@alchemy/aa-alchemy";

const multisigAccountClient = createMultisigAccountAlchemyClient({
    chain,
    signers[2], // using the last signer
    owners,
    threshold,
    apiKey: "YOUR_API_KEY",
  });

const result = await multisigAccountClient.sendUserOperation({
  uo: request.callData,
  context: aggregatedSignature,
});

```