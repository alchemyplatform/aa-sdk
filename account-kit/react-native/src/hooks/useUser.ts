import {
  useUser as useWebUser,
  type UseUserResult,
} from "@account-kit/react/hooks";

export const useUser = (): UseUserResult => useWebUser();
