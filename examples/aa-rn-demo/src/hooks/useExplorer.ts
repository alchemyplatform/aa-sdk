import { chain } from "@shared-config/env";
import { useCallback } from "react";

export type UseExplorerReturn = {
  getLink: (props: {
    address: string;
    tokenId?: string;
    type: "tx" | "address" | "nft";
  }) => string;
};

const useExplorer = (): UseExplorerReturn => {
  const getLink = useCallback(
    ({
      address,
      type,
      tokenId,
    }: {
      address: string;
      tokenId?: string;
      type: "tx" | "address" | "nft";
    }): string => {
      if (type === "tx") {
        return `${chain.blockExplorers.default.url}/${type}/${address}`;
      }

      tokenId =
        tokenId &&
        Number(tokenId) >= 0 &&
        Number(tokenId) < Number.MAX_SAFE_INTEGER
          ? `${Number(tokenId)}`
          : tokenId;

      return tokenId
        ? `${chain.blockExplorers.default.url}/${type}/${address}/${tokenId}`
        : `${chain.blockExplorers.default.url}/${type}/${address}`;
    },
    [],
  );

  return { getLink };
};

export default useExplorer;
