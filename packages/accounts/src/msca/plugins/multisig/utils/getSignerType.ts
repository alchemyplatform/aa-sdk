import type {
  SmartContractAccount,
  SmartAccountSigner,
} from "@alchemy/aa-core";
import {
  type Transport,
  type Chain,
  type Client,
  type PublicRpcSchema,
  type PublicActions,
  type Hex,
  size,
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
  > = Client<TTransport, TChain, TAccount, PublicRpcSchema, PublicActions>
> = {
  signer: SmartAccountSigner<any>;
  signature: Hex;
  client: TClient;
};

export const getSignerType = async <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined
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
