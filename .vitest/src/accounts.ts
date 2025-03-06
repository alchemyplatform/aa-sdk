import type {
  EntryPointAbi_v6,
  EntryPointAbi_v7,
  SmartAccountClient,
  SmartContractAccount,
} from "@aa-sdk/core";
import {
  encodeFunctionData,
  getContract,
  type Chain,
  type Client,
  type PublicClient,
  type Transport,
} from "viem";
import { setBalance } from "viem/actions";

export async function resetBalance<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartContractAccount = SmartContractAccount,
>(
  client: SmartAccountClient<transport, chain, account>,
  testClient: Client & { mode: "anvil" },
) {
  const ep = client.account.getEntryPoint();
  const entryPointContract = getContract({
    abi:
      ep.version === "0.6.0"
        ? (ep.abi as typeof EntryPointAbi_v6)
        : (ep.abi as typeof EntryPointAbi_v7),
    client: client as unknown as PublicClient,
    address: ep.address,
  });

  const balance = await entryPointContract.read.balanceOf([
    client.account.address,
  ]);

  if (balance > 0n) {
    const { hash } = await client.sendUserOperation({
      uo: {
        target: ep.address,
        data: encodeFunctionData({
          abi: entryPointContract.abi,
          functionName: "withdrawTo",
          args: [client.account.address, balance],
        }),
      },
      account: client.account,
    });

    await client.waitForUserOperationTransaction({ hash });
  }

  await setBalance(testClient, {
    address: client.account.address,
    value: 0n,
  });
}
