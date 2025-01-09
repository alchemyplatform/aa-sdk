import { zeroAddress, type PublicClient } from "viem";

import { type SmartAccountSigner, type BundlerClient } from "@aa-sdk/core";

import { type AlchemyTransport } from "@account-kit/infra";

import { createSMA7702AccountClient } from "@account-kit/smart-contracts/experimental";

import { mekong } from "./transportSetup";

export const send7702UO = async (
  client: PublicClient & BundlerClient,
  transport: AlchemyTransport,
  signer: SmartAccountSigner
) => {
  console.log(
    "supported entry points: ",
    await client.getSupportedEntryPoints()
  );

  const accountClient = await createSMA7702AccountClient({
    chain: mekong,
    transport,
    signer,
  });

  const uoHash = await accountClient.sendUserOperation({
    uo: {
      target: zeroAddress,
      data: "0x",
      value: BigInt(0),
    },
  });

  const txnHash = await accountClient.waitForUserOperationTransaction(uoHash);
  // const txnHash = await accountClient.waitForUserOperationTransaction({ hash: "0x4115f6006e0418bdaf42d71f124a31be50f473aeacc2915638c97a6a1d3a8750" });

  console.log("txnHash: ", txnHash);
};
