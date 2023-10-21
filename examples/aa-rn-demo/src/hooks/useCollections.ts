import {
  type ContractForOwner,
  type GetContractsForOwnerResponse,
} from "alchemy-sdk";
import _ from "lodash";
import { useMemo } from "react";
import { useInfiniteQuery } from "react-query";
import { ApiEnum } from "types/query";
import { type Hex } from "viem";
import { useAlchemy } from "./useAlchemy";

export type UseCollectionsReturn = {
  items: ContractForOwner[];
  fetchNextPage: () => void;
  hasNextPage: boolean;
  refetch: () => void;
  remove: () => void;
  isRefetching: boolean;
  loading: boolean;
};

const useCollections = ({
  owner,
  onError,
}: {
  owner: Hex | undefined;
  onError?: (error: unknown) => void;
}): UseCollectionsReturn => {
  const { getNftCollections } = useAlchemy();
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
    [ApiEnum.COLLECTION, owner],
    async ({ pageParam = undefined }) => {
      if (owner) {
        const ret = await getNftCollections(owner, {
          pageKey: pageParam,
          onError,
        });
        if (ret !== null) {
          return ret;
        }
      }
      return {
        contracts: [],
        totalCount: 0,
      } as GetContractsForOwnerResponse;
    },
    {
      getNextPageParam: (lastPage) => lastPage.pageKey,
      enabled: !!owner,
    },
  );

  const items = useMemo(
    () => _.flatten(data?.pages.map((x) => x.contracts)),
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

export default useCollections;
