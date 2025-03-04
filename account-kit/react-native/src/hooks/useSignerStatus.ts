import {
  useSignerStatus as useWebSignerStatus,
  type UseSignerStatusResult,
} from "@account-kit/react/hooks";

export const useSignerStatus = (): UseSignerStatusResult =>
  useWebSignerStatus();
