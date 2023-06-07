import { useAccount, useChainId } from "wagmi";
import { useEffect, useState } from "react";
import { localSmartContractStore } from "./localStorage";

export type AppState =
  | {
      state: "LOADING";
      eoaAddress: undefined;
      scwAddresses: undefined;
    }
  | {
      state: "UNCONNECTED";
      eoaAddress: undefined;
      scwAddresses: undefined;
    }
  | {
      state: "NO_SCW";
      eoaAddress: string;
      scwAddresses: undefined;
    }
  | {
      state: "HAS_SCW";
      eoaAddress: string;
      scwAddresses: string[];
    };

export function useAppState(): AppState {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const [state, setState] = useState<AppState>({
    state: "UNCONNECTED",
    eoaAddress: undefined,
    scwAddresses: undefined,
  });
  useEffect(() => {
    if (!isConnected || !address) {
      setState({
        state: "UNCONNECTED",
        eoaAddress: undefined,
        scwAddresses: undefined,
      });
      return;
    }
    const scwAddresses = localSmartContractStore.smartAccountAddresses(
      address,
      chainId
    );
    if (scwAddresses.length === 0) {
      setState({
        state: "NO_SCW",
        eoaAddress: address as `0x${string}`,
        scwAddresses: undefined,
      });
    } else {
      setState({
        state: "HAS_SCW",
        eoaAddress: address as `0x${string}`,
        scwAddresses: scwAddresses,
      });
    }
  }, [address, isConnected, chainId]);
  return state;
}
