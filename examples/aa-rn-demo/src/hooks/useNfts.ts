import { type OwnedNft, type OwnedNftsResponse } from "alchemy-sdk";
import _ from "lodash";
import { useMemo } from "react";
import { useInfiniteQuery } from "react-query";
import { ApiEnum } from "types/query";
import { type Hex } from "viem";
import { useAlchemy } from "./useAlchemy";

export type UseNftsReturn = {
  items: OwnedNft[];
  fetchNextPage: () => void;
  hasNextPage: boolean;
  refetch: () => void;
  remove: () => void;
  isRefetching: boolean;
  loading: boolean;
};

const useNfts = ({
  owner,
  contract,
  onError,
}: {
  owner: Hex | undefined;
  contract?: Hex;
  onError?: (error: unknown) => void;
}): UseNftsReturn => {
  const { getNfts } = useAlchemy();
  const {
    data,
    fetchNextPage,
    hasNextPage = false,
    refetch,
    remove,
    isRefetching,
    isLoading,
    isFetchingNextPage,
  } = useInfiniteQuery(
    [ApiEnum.NFT, owner, contract],
    async ({ pageParam = "" }) => {
      if (owner) {
        const ret = await getNfts(owner, {
          contract,
          pageKey: pageParam,
          onError,
        });
        if (ret !== null) {
          return ret;
        }
      }
      return {
        ownedNfts: [],
        totalCount: 0,
        blockHash: "0x",
      } as OwnedNftsResponse;
    },
    {
      getNextPageParam: (lastPage) => lastPage.pageKey,
      enabled: !!owner,
    },
  );

  const items = useMemo(
    () => _.flatten(data?.pages.map((x) => x.ownedNfts)),
    [data],
  );

  const loading = useMemo(
    () => isLoading || isFetchingNextPage,
    [isLoading, isFetchingNextPage],
  );

  return {
    items,
    fetchNextPage,
    hasNextPage,
    refetch,
    remove,
    isRefetching,
    loading,
  };
};

export default useNfts;
