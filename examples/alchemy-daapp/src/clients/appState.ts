import { useAccount } from "wagmi";
import { useNFTsQuery } from "../surfaces/profile/NftSection";
import { useEffect, useState } from "react";

export type AppState =
  | {
      state: "LOADING";
      eoaAddress: undefined;
      scwAddress: undefined;
    }
  | {
      state: "UNCONNECTED";
      eoaAddress: undefined;
      scwAddress: undefined;
    }
  | {
      state: "NO_SCW";
      eoaAddress: string;
      scwAddress: undefined;
    }
  | {
      state: "HAS_SCW";
      eoaAddress: string;
      scwAddress: string;
    };

export function useAppState(): AppState {
  const { address, isConnected } = useAccount();
  const scwAddress = address ? localStorage.getItem(address) : undefined;

  const [state, setState] = useState<AppState>({
    state: "UNCONNECTED",
    eoaAddress: undefined,
    scwAddress: undefined,
  });
  useEffect(() => {
    if (!isConnected || !address) {
      setState({
        state: "UNCONNECTED",
        eoaAddress: undefined,
        scwAddress: undefined,
      });
      return;
    }

    if (!scwAddress) {
      setState({
        state: "NO_SCW",
        eoaAddress: address as `0x${string}`,
        scwAddress: undefined,
      });
    } else {
      setState({
        state: "HAS_SCW",
        eoaAddress: address as `0x${string}`,
        scwAddress: scwAddress!,
      });
    }
  }, [address, isConnected, scwAddress]);
  return state;
}
