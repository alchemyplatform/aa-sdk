import { zeroAddress, type PublicClient } from "viem";

import { type SmartAccountSigner, type BundlerClient } from "@aa-sdk/core";

import {
  alchemyFeeEstimator,
  alchemyGasManagerMiddleware,
  type AlchemyTransport,
} from "@account-kit/infra";

import { createSMA7702AccountClient } from "@account-kit/smart-contracts/experimental";

import { odyssey } from "../../../hooks/7702/transportSetup";

export const send7702UO = async (
  client: PublicClient & BundlerClient,
  transport: AlchemyTransport,
  signer: SmartAccountSigner
) => {
  console.log(
    "supported entry points: ",
    await client.getSupportedEntryPoints()
  );

  console.log(
    "reading env from client",
    process.env.NEXT_PUBLIC_PAYMASTER_POLICY_ID
  );

  const accountClient = await createSMA7702AccountClient({
    chain: odyssey,
    transport,
    signer,
    feeEstimator: alchemyFeeEstimator(transport),
    ...alchemyGasManagerMiddleware(
      process.env.NEXT_PUBLIC_PAYMASTER_POLICY_ID!
    ),
  });

  const uoHash = await accountClient.sendUserOperation({
    uo: {
      target: zeroAddress,
      data: "0x",
      value: BigInt(0),
    },
  });

  const txnHash = await accountClient.waitForUserOperationTransaction(uoHash);

  console.log("txnHash: ", txnHash);
};
