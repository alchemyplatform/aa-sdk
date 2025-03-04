import {
  useSignMessage as useWebSignMessage,
  type UseSignMessageArgs,
  type UseSignMessageResult,
} from "@account-kit/react/hooks";

export const useSignMessage = (
  args: UseSignMessageArgs
): UseSignMessageResult => useWebSignMessage(args);
