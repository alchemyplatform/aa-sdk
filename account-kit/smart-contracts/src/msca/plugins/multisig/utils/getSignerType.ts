import type { SmartAccountSigner, SmartContractAccount } from "@aa-sdk/core";
import {
  type Chain,
  type Client,
  type Hex,
  type PublicActions,
  type PublicRpcSchema,
  size,
  type Transport,
} from "viem";
import type { SignerType } from "../types";

type GetSignerTypeParams<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TClient extends Client<
    TTransport,
    TChain,
    TAccount,
    PublicRpcSchema,
    PublicActions
  > = Client<TTransport, TChain, TAccount, PublicRpcSchema, PublicActions>,
> = {
  signer: SmartAccountSigner<any>;
  signature: Hex;
  client: TClient;
};

/**
 * Determines the type of signer (Externally Owned Account (EOA) or CONTRACT) based on the provided client, signature, and signer.
 *
 * @example
 * ```ts
 * import { getSignerType } from "@account-kit/smart-contracts";
 * import { LocalAccountSigner } from "@aa-sdk/core";
 * import { createPublicClient, generatePrivateKey } from "viem";
 *
 * const signer = LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey());
 * const client = createPublicClient(...);
 * const signature = signer.signMessage("Hello World");
 *
 * const signerType = await getSignerType({ client, signature, signer }); // EOA
 * ```
 *
 * @param {GetSignerTypeParams<TTransport, TChain>} params the parameters including the client, signature, and signer
 * @returns {Promise<SignerType>} A promise that resolves to the signer type, which is either "EOA" or "CONTRACT"
 */
export const getSignerType = async <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
>({
  client,
  signature,
  signer,
}: GetSignerTypeParams<TTransport, TChain>): Promise<SignerType> => {
  const signerAddress = await signer.getAddress();
  const byteCode = await client.getBytecode({ address: signerAddress });

  return (byteCode ?? "0x") === "0x" && size(signature) === 65
    ? "EOA"
    : "CONTRACT";
};
