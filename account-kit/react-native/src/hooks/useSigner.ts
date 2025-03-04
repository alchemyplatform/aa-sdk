import { useSigner as useWebSigner } from "@account-kit/react/hooks";
import type { RNAlchemySignerType } from "@account-kit/react-native-signer";

export const useSigner = (): RNAlchemySignerType | null =>
  useWebSigner<RNAlchemySignerType>();
