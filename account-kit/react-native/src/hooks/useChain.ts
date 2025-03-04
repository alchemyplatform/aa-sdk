import {
  useChain as useWebChain,
  type UseChainParams,
  type UseChainResult,
} from "@account-kit/react/hooks";

export const useChain = (mutationArgs?: UseChainParams): UseChainResult =>
  useWebChain(mutationArgs);
