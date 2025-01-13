import { zeroAddress, type PublicClient } from "viem";

import { type SmartAccountSigner, type BundlerClient } from "@aa-sdk/core";

import { alchemyFeeEstimator, type AlchemyTransport } from "@account-kit/infra";

import { createSMA7702AccountClient } from "@account-kit/smart-contracts/experimental";

import { odyssey } from "./transportSetup";

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
    chain: odyssey,
    transport,
    signer,
    feeEstimator: alchemyFeeEstimator(transport),
  });

  const uoHash = await accountClient.sendUserOperation({
    uo: {
      target: zeroAddress,
      data: "0x",
      value: BigInt(0),
    },
    overrides: {
      maxFeePerGas: {
        multiplier: 1.5,
      },
      maxPriorityFeePerGas: {
        multiplier: 1.5,
      },
    },
  });

  const txnHash = await accountClient.waitForUserOperationTransaction(uoHash);
  // const txnHash = await accountClient.waitForUserOperationTransaction({
  //   hash: "0xc0752298b3d149e973974d14c4598d354e71e822db7600de28efb637ab03325c",
  // });

  console.log("txnHash: ", txnHash);
};
