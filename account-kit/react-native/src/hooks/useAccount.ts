import type { SupportedAccountTypes } from "@account-kit/core";
import {
  useAccount as useWebAccount,
  type UseAccountProps,
} from "@account-kit/react/hooks";

export const useAccount = (params: UseAccountProps<SupportedAccountTypes>) =>
  useWebAccount(params);
