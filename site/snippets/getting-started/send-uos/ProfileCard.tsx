"use client";

import { MultiOwnerModularAccount } from "@alchemy/aa-accounts";
import { User, createAlchemySmartAccountClient } from "@alchemy/aa-alchemy";
import { useState } from "react";
import { arbitrumSepolia } from "viem/chains";
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
      chain: arbitrumSepolia,
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
