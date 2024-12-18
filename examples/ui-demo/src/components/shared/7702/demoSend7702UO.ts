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
  HDAccount,
} from "viem";

import {
  type BundlerClient,
  createSmartAccountClientFromExisting,
} from "@aa-sdk/core";

import { alchemyFeeEstimator, type AlchemyTransport } from "@account-kit/infra";

export const send7702UO = async (
  client: PublicClient & BundlerClient,
  transport: AlchemyTransport,
  localAccount: HDAccount
) => {
  console.log(
    "supported entry points: ",
    await client.getSupportedEntryPoints()
  );

  const accountClient = createSmartAccountClientFromExisting({
    client,
    feeEstimator: alchemyFeeEstimator(transport),
  });

  accountClient.sendUserOperation({
    uo: {
      target: zeroAddress,
      data: "0x",
      value: 0n,
    },
  });
};
