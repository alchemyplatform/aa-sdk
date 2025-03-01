import {
  RNAlchemySigner,
  type RNAlchemySignerParams,
} from "@account-kit/react-native-signer";

export const createRNSigner = (params: RNAlchemySignerParams) => {
  const { client, sessionConfig } = params;

  return RNAlchemySigner({
    client,
    sessionConfig,
  });
};
