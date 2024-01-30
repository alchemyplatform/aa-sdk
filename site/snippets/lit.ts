import { polygonMumbai } from "@alchemy/aa-core";
import { LitAuthMethod, LitSigner } from "@alchemy/aa-signers/lit-protocol";

const API_KEY = "<YOUR API KEY>";
const POLYGON_MUMBAI_RPC_URL = `${polygonMumbai.rpcUrls.alchemy.http[0]}/${API_KEY}`;
const PKP_PUBLIC_KEY = "<YOUR PKP PUBLIC KEY>";

export const createLitSignerWithAuthMethod = async () => {
  return new LitSigner<LitAuthMethod>({
    pkpPublicKey: PKP_PUBLIC_KEY,
    rpcUrl: POLYGON_MUMBAI_RPC_URL,
  });
};
