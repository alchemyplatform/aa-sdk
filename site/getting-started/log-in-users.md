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

# Log users into Embedded Accounts

In this step of the Embedded Accounts Quickstart, you’ll create your app’s log in experience, where users will log in to receive an email to authenticate themselves on your app, creating their Embedded Account.

## Add Log In User Interface

To create the user log in experience, add a `src/components` folder and create `src/components/LogInCard.tsx` and `src/components/TurnkeyIframe.tsx` with the following:

::: code-group

```ts [src/components/LogInCard.tsx]
"use client";

import { useCallback, useState } from "react";

export const LogInCard = () => {
  const [email, setEmail] = useState<string>("");
  const onEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
    []
  );

  return (
    <div className="flex min-w-80 flex-row justify-center rounded-lg bg-white p-10 dark:bg-[#0F172A]">
      <div className="flex flex-col gap-8">
        <div className="text-[18px] font-semibold">
          Log in to the Embedded Accounts Demo!
        </div>
        <div className="flex flex-col justify-between gap-6">
          <input
            className="rounded-lg border border-[#CBD5E1] p-3 dark:border-[#475569] dark:bg-slate-700 dark:text-white dark:placeholder:text-[#E2E8F0]"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={onEmailChange}
          />
          <button className="w-full transform rounded-lg bg-[#363FF9] p-3 font-semibold text-[#FBFDFF] transition duration-500 ease-in-out hover:scale-105">
            Log in
          </button>
        </div>
      </div>
    </div>
  );
};
```

```ts [src/components/TurnkeyIframe.tsx]
const iframeCss = `
iframe {
    box-sizing: border-box;
    width: 100%;
    height: 120px;
    border-radius: 8px;
    border-width: 1px;
    border-style: solid;
    border-color: rgba(216, 219, 227, 1);
    padding: 20px;
}
`;

export const TurnkeyIframe = () => {
  return (
    <div
      className="w-full"
      style={{ display: "none" }}
      id="turnkey-iframe-container-id"
    >
      <style>{iframeCss}</style>
    </div>
  );
};
```

:::

`src/components/LogInCard.tsx` creates the UI for your app, while `src/components/TurnkeyIframe.tsx` embeds a hidden iframe in your app that the Alchemy Signer will use to send the user an email and authenticate them. You’ll configure the Alchemy Signer in the next step.

Now, incorporate these components into your app by updating the `src/app/page.tsx` file as follows:

```ts [src/app/page.tsx]
"use client";

import { LogInCard } from "../components/LogInCard";
import { TurnkeyIframe } from "../components/TurnkeyIframe";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-24">
      <LogInCard />
      <TurnkeyIframe />
    </main>
  );
}
```

You’ve now added the UI for your app! At this point run the application using:

::: code-group

```bash [npm]
npm run dev
```

```bash [yarn]
yarn dev
```

```bash [pnpm]
pnpm run dev
```

:::

Your application should look like the below image!

<img src="/images/quickstart/embedded-accounts-ui.png" alt="Embedded Accounts UI" />

In the next step, you’ll add functionality to the “Log In” button to send an email to the user to authenticate them.

## Support Email Auth with Alchemy Signer

To support email authentication using the Alchemy Signer to created Embedded Accounts, create a new folder `src/queries` and add the following in a new file called `src/queries/authenticateUser.tsx`:

```ts [src/queries/authenticateUser.tsx]
import { createMultiOwnerModularAccount } from "@alchemy/aa-accounts";
import { AlchemySigner } from "@alchemy/aa-alchemy";
import { createBundlerClient, optimismSepolia } from "@alchemy/aa-core";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { custom, http } from "viem";

export const useAuthenticateUser = (signer: AlchemySigner | undefined) => {
  const params = useSearchParams();
  const router = useRouter();

  const authUser = useCallback(async () => {
    if (params.get("bundle") != null) {
      await signer!.authenticate({
        type: "email",
        bundle: params.get("bundle")!,
      });

      router.push("/");
    }

    const user = await signer!.getAuthDetails().catch(() => {
      return undefined;
    });

    const publicClient = createBundlerClient({
      chain: optimismSepolia,
      transport: http("/api/rpc"),
    });

    const account = user
      ? await createMultiOwnerModularAccount({
          transport: custom(publicClient),
          chain: optimismSepolia,
          signer: signer!,
        })
      : undefined;

    return { user, account };
  }, [params, signer, router]);

  const { mutate: authenticateUser, isPending: isAuthenticatingUser } =
    useMutation({
      mutationFn: signer?.authenticate,
      onSuccess: authUser,
    });

  const {
    data,
    isLoading: isLoadingUser,
    refetch: refetchUserDetails,
  } = useQuery({
    queryKey: ["user-details"],
    queryFn: authUser,
  });

  return {
    user: data?.user,
    account: data?.account,
    isLoadingUser,
    refetchUserDetails,
    isAuthenticatingUser,
    authenticateUser,
  };
};
```

This method will request the Alchemy Signer through the app’s backend to send an email to the email address they typed in your app. Now, incorporate this method into your src/components/LogInCard.tsx file:

```ts [src/components/LogInCard.tsx]
"use client";

import { useAuthenticateUser } from "@/queries/authenticateUser";
import { AlchemySigner } from "@alchemy/aa-alchemy";
import { useCallback, useState } from "react";

export interface LoginCardProps {
  signer: AlchemySigner | undefined;
}

export const LogInCard = ({ signer }: LoginCardProps) => {
  const [email, setEmail] = useState<string>("");
  const onEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
    []
  );

  const { isAuthenticatingUser, authenticateUser } =
    useAuthenticateUser(signer);

  return (
    <div className="flex min-w-80 flex-row justify-center rounded-lg bg-white p-10 dark:bg-[#0F172A]">
      {isAuthenticatingUser ? (
        <div className="text-[18px] font-semibold">Check your email!</div>
      ) : (
        <div className="flex flex-col gap-8">
          <div className="text-[18px] font-semibold">
            Log in to the Embedded Accounts Demo!
          </div>
          <div className="flex flex-col justify-between gap-6">
            <input
              className="rounded-lg border border-[#CBD5E1] p-3 dark:border-[#475569] dark:bg-slate-700 dark:text-white dark:placeholder:text-[#E2E8F0]"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={onEmailChange}
            />
            <button
              className="w-full transform rounded-lg bg-[#363FF9] p-3 font-semibold text-[#FBFDFF] transition duration-500 ease-in-out hover:scale-105"
              onClick={() => authenticateUser({ type: "email", email })}
            >
              Log in
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
```

You’ll also want a new UI to display a user’s Embedded Account address and their authenticated email when they redirect from the email they receive to log into your app. Add a UI card called src/app/components/ProfileCard.tsx and drop in the following code:

```ts [src/app/components/ProfileCard.tsx]
"use client";

import { MultiOwnerModularAccount } from "@alchemy/aa-accounts";
import { User, createAlchemySmartAccountClient } from "@alchemy/aa-alchemy";
import { useState } from "react";
import { optimismSepolia } from "viem/chains";

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
      </div>
    </div>
  );
};
```

Lastly, update the UI in src/app/page.tsx to render either the src/app/components/LogInCard.tsx or src/app/components/ProfileCard.tsx if the user has authenticated upon redirect from email.

```ts [src/app/page.tsx]
"use client";

import { LogInCard } from "@/components/LogInCard";
import { ProfileCard } from "@/components/ProfileCard";
import { useAuthenticateUser } from "@/queries/authenticateUser";
import { AlchemySigner } from "@alchemy/aa-alchemy";
import { useState } from "react";
import { TurnkeyIframe } from "../components/TurnkeyIframe";

export default function Home() {
  const [signer] = useState<AlchemySigner | undefined>(() => {
    if (typeof window === "undefined") return undefined;

    return new AlchemySigner({
      client: {
        connection: {
          rpcUrl: "/api/rpc",
        },
        iframeConfig: {
          iframeContainerId: "turnkey-iframe-container-id",
        },
      },
    });
  });

  const { user, account, isLoadingUser } = useAuthenticateUser(signer);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-24">
      {isLoadingUser ? (
        // Loading spinner
        <div className="flex items-center justify-center">
          <div
            className="text-surface inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
            role="status"
          ></div>
        </div>
      ) : user != null && account != null ? (
        <ProfileCard user={user} account={account} />
      ) : (
        <LogInCard signer={signer} />
      )}
      <TurnkeyIframe />
    </main>
  );
}
```

You’ve now added the full authentication flow for users to create Embedded Accounts, and the experience should look like the video below!

TODO: REPLACE VIDEO
<VideoEmbed src="/videos/embedded-accounts-auth.mp4" />
