import type {
  GetAccountParameter,
  SmartAccountClient,
  SmartAccountSigner,
} from "@alchemy/aa-core";
import type { Chain, Hex, Transport } from "viem";
import type { LightAccount } from "./account";

export const transferOwnership: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TOwner extends SmartAccountSigner = SmartAccountSigner,
  TAccount extends LightAccount<TOwner> | undefined =
    | LightAccount<TOwner>
    | undefined
>(
  client: SmartAccountClient<TTransport, TChain, TAccount>,
  args: {
    newOwner: TOwner;
    waitForTxn?: boolean;
  } & GetAccountParameter<TAccount, LightAccount>
) => Promise<Hex> = async (
  client,
  { newOwner, waitForTxn = false, account = client.account }
): Promise<Hex> => {
  if (!account) {
    throw new Error("Account is not defined");
  }

  const data = account.encodeTransferOwnership(await newOwner.getAddress());
  const result = await client.sendUserOperation({
    uo: {
      target: account.address,
      data,
      account,
    },
    account,
  });

  account.setOwner(newOwner);

  if (waitForTxn) {
    return client.waitForUserOperationTransaction(result);
  }

  return result.hash;
};
