import { useQuery } from "@tanstack/react-query";
import { useConfigStore } from "@/state";
import { useAccount } from "@account-kit/react";
import { useState } from "react";
import { createPublicClient, http } from "viem";
import { baseSepolia } from "@account-kit/infra";
import { useSignerAddress } from "./useSignerAddress";

export const useDeploymentStatus = () => {
  const { accountMode } = useConfigStore(({ accountMode }) => ({
    accountMode,
  }));

  const { account } = useAccount({
    type: "ModularAccountV2",
    accountParams: { mode: accountMode },
  });

  const [publicClient] = useState(() =>
    createPublicClient({
      chain: baseSepolia,
      transport: http(),
    }),
  );
  const signerAddress = useSignerAddress();

  const { data: hybridAccount, refetch: refetchHybridAccount } = useQuery({
    queryKey: ["deploymentStatus7702", signerAddress ?? "0x"],
    queryFn: async () => {
      const delegationAddress = signerAddress
        ? ((await publicClient.getCode({
            address: signerAddress,
          })) ?? "0x")
        : "0x";
      const delegationStatus = delegationAddress !== "0x";
      return {
        delegationAddress,
        delegationStatus,
      };
    },
    enabled: !!account && accountMode === "7702",
  });

  const { data: deploymentStatusSCA = false, refetch: refetchSCA } = useQuery({
    queryKey: ["deploymentStatusSCA", signerAddress, accountMode],
    queryFn: async () => {
      const initCode = await account?.getInitCode();
      return !initCode ? false : initCode === "0x";
    },
    enabled: !!account && accountMode === "default",
  });

  return accountMode === "7702"
    ? {
        isDeployed: hybridAccount?.delegationStatus ?? false,
        address: signerAddress,
        delegationAddress: hybridAccount?.delegationAddress,
        refetch: refetchHybridAccount,
      }
    : {
        isDeployed: deploymentStatusSCA,
        address: account?.address,
        delegationAddress: undefined,
        refetch: refetchSCA,
      };
};
