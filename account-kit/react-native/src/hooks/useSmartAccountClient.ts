import type {
  SupportedAccount,
  SupportedAccountTypes,
} from "@account-kit/core";
import {
  useSmartAccountClient as useWebSmartAccountClient,
  type UseSmartAccountClientProps,
  type UseSmartAccountClientResult,
} from "@account-kit/react/hooks";
import type { Chain } from "viem";

export const useSmartAccountClient = <
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SupportedAccountTypes | undefined = "ModularAccountV2"
>(
  args: UseSmartAccountClientProps<TChain, TAccount>
): UseSmartAccountClientResult<
  TChain,
  SupportedAccount<TAccount extends undefined ? "ModularAccountV2" : TAccount>
> => useWebSmartAccountClient(args);
