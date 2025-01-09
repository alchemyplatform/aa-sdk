import {
  http,
  encodeFunctionData,
  createWalletClient,
  publicActions,
  getContract,
  type Hex,
  zeroAddress,
  custom,
  type Chain,
  defineChain,
  type PublicClient,
  PrivateKeyAccount,
} from "viem";

import { LocalAccountSigner, type BundlerClient } from "@aa-sdk/core";

import { alchemyFeeEstimator, type AlchemyTransport } from "@account-kit/infra";

import { createSMA7702AccountClient } from "@account-kit/smart-contracts/experimental";

import { mekong } from "./transportSetup";

export const send7702UO = async (
  client: PublicClient & BundlerClient,
  transport: AlchemyTransport,
  localAccount: PrivateKeyAccount
) => {
  console.log(
    "supported entry points: ",
    await client.getSupportedEntryPoints()
  );

  const accountClient = await createSMA7702AccountClient({
    chain: mekong,
    transport,
    signer: new LocalAccountSigner(localAccount),
  });

  const txnHash = await accountClient.sendUserOperation({
    uo: {
      target: zeroAddress,
      data: "0x",
      value: BigInt(0),
    },
  });

  console.log("txnHash: ", txnHash);
};
