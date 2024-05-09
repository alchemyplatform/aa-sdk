import { FordefiSigner } from "@alchemy/aa-signers/fordefi";
import { FordefiWeb3Provider } from "@fordefi/web3-provider";

const fordefi = new FordefiWeb3Provider({
  address: "0x1234567890123456789012345678901234567890",
  chainId: 11155111,
  apiUserToken: process.env.FORDEFI_API_USER_TOKEN!,
  apiPayloadSignKey: process.env.FORDEFI_API_PAYLOAD_SIGNING_KEY!,
});

export const createFordefiSigner = async () => {
  const fordefiSigner = new FordefiSigner(fordefi);

  await fordefiSigner.authenticate();

  return fordefiSigner;
};
