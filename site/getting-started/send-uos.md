---
outline: deep
head:
  - - meta
    - property: og:title
      content: Getting started guide
  - - meta
    - name: description
      content: Learn how to get started with Alchemy's Embedded Accounts using Account Kit and the Alchemy Signer, Modular Smart Contract Account, Rundler and Gas Manager.
  - - meta
    - property: og:description
      content: Learn how to get started with Alchemy's Embedded Accounts using Account Kit and the Alchemy Signer, Modular Smart Contract Account, Rundler and Gas Manager.
  - - meta
    - name: twitter:title
      content: Getting started guide
  - - meta
    - name: twitter:description
      content: Learn how to get started with Alchemy's Embedded Accounts using Account Kit and the Alchemy Signer, Modular Smart Contract Account, Rundler and Gas Manager.
---

# Send UserOperations

All that’s left to do is enable users to send UserOperations through their newly created Embedded Account on your app. Add a new query to `src/queries/sendUserOperation.tsx`:

```ts [src/queries/sendUserOperation.tsx]
import { MultiOwnerModularAccount } from "@alchemy/aa-accounts";
import { AlchemySmartAccountClient } from "@alchemy/aa-alchemy";
import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
import { Address, Chain, Transport } from "viem";

export const useSendUserOperation = (
  provider:
    | AlchemySmartAccountClient<Transport, Chain, MultiOwnerModularAccount>
    | undefined
) => {
  const sendUO = useCallback(async () => {
    if (provider == null) {
      return;
    }

    const vitalik: Address = "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B";

    const { hash } = await provider.sendUserOperation({
      uo: {
        target: vitalik,
        data: "0x",
      },
    });

    const txnHash = await provider.waitForUserOperationTransaction({
      hash,
    });

    return { uoHash: hash, txnHash };
  }, [provider]);

  const {
    mutate: sendUserOperation,
    data,
    isPending: isPendingUserOperation,
    isError: isSendUserOperationError,
  } = useMutation({
    mutationFn: sendUO,
  });

  return {
    sendUserOperation,
    uoHash: data?.uoHash,
    txnHash: data?.txnHash,
    isPendingUserOperation,
    isSendUserOperationError,
  };
};
```

This method will send a request to Alchemy’s infrastructure to send a UserOperation. It uses the `AlchemySmartAccountClient` from the Alchemy Account Kit. Check out the [AlchemySmartAccountClient docs](https://accountkit.alchemy.com/packages/aa-alchemy/smart-account-client/) for more details.

Now, incorporate this request on a new `src/components/SendUOButton.tsx` file and add it to the `src/components/ProfileCard.tsx` for authenticated users to send a UO. These files should look as follows:

::: code-group

```ts [src/components/ProfileCard.tsx]
"use client";

import { MultiOwnerModularAccount } from "@alchemy/aa-accounts";
import { User, createAlchemySmartAccountClient } from "@alchemy/aa-alchemy";
import { useState } from "react";
import { optimismSepolia } from "viem/chains";
import { SendUOButton } from "./SendUOButton";

export interface ProfileCardProps {
  user: User;
  account: MultiOwnerModularAccount;
}

export const ProfileCard = ({ user, account }: ProfileCardProps) => {
  const [provider] = useState(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    const gasManagerPolicyId =
      process.env.NEXT_PUBLIC_ALCHEMY_GAS_MANAGER_POLICY_ID;

    if (gasManagerPolicyId == null) {
      throw new Error("Missing gas policy ID");
    }

    return createAlchemySmartAccountClient({
      chain: optimismSepolia,
      rpcUrl: "/api/rpc",
      account,
      gasManagerConfig: {
        policyId: gasManagerPolicyId,
      },
      opts: {
        txMaxRetries: 20,
      },
    });
  });

  return (
    <div className="flex flex-row rounded-lg bg-white p-10 dark:bg-[#0F172A]">
      <div className="flex flex-col gap-8">
        <div className="text-lg font-semibold">Welcome to your profile!</div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div>Account address</div>
            <div className="text-wrap rounded-lg border p-3 dark:border-[#475569] dark:bg-[#1F2937] dark:text-[#CBD5E1]">
              {provider?.account.address}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div>Email</div>
            <div className="text-wrap rounded-lg border p-3 dark:border-[#475569] dark:bg-[#1F2937] dark:text-[#CBD5E1]">
              {user?.email}
            </div>
          </div>
        </div>
        <SendUOButton provider={provider} />
      </div>
    </div>
  );
};
```

```ts [src/components/SendUOButton.tsx]
import { useSendUserOperation } from "@/queries/sendUserOperation";
import { MultiOwnerModularAccount } from "@alchemy/aa-accounts";
import { AlchemySmartAccountClient } from "@alchemy/aa-alchemy";
import { Chain, Transport } from "viem";
import { optimismSepolia } from "viem/chains";

export interface SendUOButtonProps {
  provider:
    | AlchemySmartAccountClient<Transport, Chain, MultiOwnerModularAccount>
    | undefined;
}

export const SendUOButton = ({ provider }: SendUOButtonProps) => {
  const {
    sendUserOperation,
    txnHash,
    isPendingUserOperation,
    isSendUserOperationError,
  } = useSendUserOperation(provider);

  return (
    <div className="flex flex-col">
      {txnHash == null ? (
        <button
          className="w-full transform rounded-lg bg-[#363FF9] p-3 font-semibold text-[#FBFDFF] transition duration-500 ease-in-out hover:scale-105 disabled:bg-[#C0D4FF] disabled:hover:scale-100 dark:disabled:bg-[#4252C5]"
          onClick={() => sendUserOperation()}
          disabled={isPendingUserOperation}
        >
          <div className="flex flex-row items-center justify-center gap-3">
            {isPendingUserOperation && (
              <div
                className="text-surface inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
                role="status"
              ></div>
            )}
            {isPendingUserOperation
              ? "Sending"
              : isSendUserOperationError
              ? "An error occurred. Try again!"
              : "Send a test transaction"}
          </div>
        </button>
      ) : (
        <a
          href={`${optimismSepolia.blockExplorers.default.url}/tx/${txnHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full transform rounded-lg bg-[#363FF9] p-3 font-semibold transition duration-500 ease-in-out hover:scale-105"
        >
          View transaction details
        </a>
      )}
    </div>
  );
};
```

:::

That’s it! You’ve now enabled users to sendUOs from their Embedded Account on your application, and the experience should look like the video below!

TODO: REPLACE VIDEO
<VideoEmbed src="/videos/embedded-accounts-auth.mp4" />

Congratulations! Using Account Kit, the Alchemy Signer, and Alchemy Modular Smart Contract Account, you created an application that authenticates a user by email to create their Embedded Account, and then uses that account to send a UserOperation!

## Dive Deeper

You can do so much more with Embedded Accounts than this Quickstart guide could share!

1. To learn more about the Alchemy Signer and how to support passkey login (and eventually social login), check out the technical [docs](https://accountkit.alchemy.com/packages/aa-alchemy/signer/overview.html) for more details.
2. To learn more about different smart account options available for your applications, check out the section **[Choosing a smart account](https://accountkit.alchemy.com/smart-accounts/)**.
3. To learn more about how to use your smart accounts and what Account Kit offers to enhance users' web3 experiences, check out a number of guides we have in the **[Using smart accounts](https://accountkit.alchemy.com/using-smart-accounts/send-user-operations.html)** section, covering from basic to advanced usages.
