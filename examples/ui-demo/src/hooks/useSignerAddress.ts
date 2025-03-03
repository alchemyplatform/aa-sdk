import { useSigner, useSignerStatus, useUser } from "@account-kit/react";
import { useQuery } from "@tanstack/react-query";
import { Address } from "viem";

export const useSignerAddress = () => {
  const user = useUser();
  const signer = useSigner();
  const { isConnected: isSignerConnected } = useSignerStatus();

  const { data: address } = useQuery({
    queryKey: ["signerAddress", user?.orgId],
    queryFn: async (): Promise<Address | undefined> => {
      if (!signer || !isSignerConnected) {
        return undefined;
      }
      return signer.getAddress();
    },
    enabled: !!user && !!signer && isSignerConnected,
  });

  return address;
};
