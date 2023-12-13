import { LitSigner, LitAuthMethod } from "@alchemy/aa-signers/lit-protocol";
import { polygonMumbai } from "viem/chains";

const API_KEY = "<YOUR API KEY>";
const POLYGON_MUMBAI_RPC_URL = `${polygonMumbai.rpcUrls.alchemy.http[0]}/${API_KEY}`;
const PKP_PUBLIC_KEY = "<YOUR PKP PUBLIC KEY>";

export const createLitSignerWithAuthMethod = async (
  authMethod: LitAuthMethod
) => {
  return new LitSigner<LitAuthMethod>({
    pkpPublicKey: PKP_PUBLIC_KEY,
    rpcUrl: POLYGON_MUMBAI_RPC_URL,
  });
};
