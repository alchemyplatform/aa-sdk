import {
  useSignTypedData as useWebSignTypedData,
  type UseSignTypedDataArgs,
  type UseSignTypedDataResult,
} from "@account-kit/react/hooks";

export const useSignTypedData = (
  args: UseSignTypedDataArgs
): UseSignTypedDataResult => useWebSignTypedData(args);
