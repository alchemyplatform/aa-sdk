import { useAccount } from "wagmi";
import { useNFTsQuery } from "./nfts";
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
  const nfts = useNFTsQuery(address);
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

    if (nfts.isLoading) {
      setState({
        state: "LOADING",
        eoaAddress: undefined,
        scwAddress: undefined,
      });
      return;
    }
    const scwNFT = nfts?.data?.ownedNfts.find((value) => {
      return value.contract.address === "0x0000000000000000";
    });
    const scwAttribute = scwNFT?.metadata.attributes?.find((attribute) => {
      attribute.trait_type === "SCW";
    });
    if (!scwNFT || !scwAttribute) {
      setState({
        state: "NO_SCW",
        eoaAddress: address as `0x${string}`,
        scwAddress: undefined,
      });
    } else {
      setState({
        state: "HAS_SCW",
        eoaAddress: address as `0x${string}`,
        scwAddress: scwAttribute.value!,
      });
    }
  }, [address, isConnected, nfts]);
  return state;
}
