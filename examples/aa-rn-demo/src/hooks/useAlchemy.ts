import { chain } from "@shared-config/env";
import {
  Alchemy,
  Network,
  NftFilters,
  type GetContractsForOwnerResponse,
  type OwnedNftsResponse,
} from "alchemy-sdk";
import { useCallback } from "react";
import Config from "react-native-config";
import { type Hex } from "viem";

export const useAlchemy = () => {
  const settings = {
    apiKey: Config.ALCHEMY_KEY,
    network: `eth-${chain.network}` as Network,
  };

  const alchemy = new Alchemy(settings);

  const getNftCollections = useCallback(
    async (
      owner: Hex,
      {
        pageKey,
        onError,
      }: {
        pageKey?: string;
        onError?: (error: unknown) => void;
      },
    ): Promise<GetContractsForOwnerResponse | null> => {
      try {
        const res = await alchemy.nft.getContractsForOwner(owner, {
          pageKey,
          excludeFilters: [NftFilters.SPAM],
        });
        return res;
      } catch (error) {
        console.error("getNftCollections", owner, error);
        onError?.(error);
        return null;
      }
    },
    [alchemy.nft],
  );

  const getNfts = useCallback(
    async (
      owner: Hex,
      {
        contract,
        pageKey,
        onError,
      }: {
        contract?: Hex;
        pageKey?: string;
        onError?: (error: unknown) => void;
      },
    ): Promise<OwnedNftsResponse | null> => {
      try {
        const res = await alchemy.nft.getNftsForOwner(owner, {
          pageKey,
          contractAddresses: contract ? [contract] : undefined,
          excludeFilters: [NftFilters.SPAM],
        });
        return res;
      } catch (error) {
        console.error("getNfts", owner, contract, error);
        onError?.(error);
        return null;
      }
    },
    [alchemy.nft],
  );

  return {
    alchemy,
    getNftCollections,
    getNfts,
  };
};
