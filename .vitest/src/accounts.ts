import {
  encodeFunctionData,
  getContract,
  type Client,
  type PublicClient,
  type TestClient,
} from "viem";
import type {
  entryPoint06Abi,
  entryPoint07Abi,
  SmartAccount,
  BundlerClient,
} from "viem/account-abstraction";
import { setBalance } from "viem/actions";

export async function resetBalance(
  client: BundlerClient<any, any, SmartAccount>,
  testClient: Client & { mode: "anvil" },
) {
  const ep = client.account!.entryPoint;
  const entryPointContract = getContract({
    abi:
      ep.version === "0.6"
        ? (ep.abi as typeof entryPoint06Abi)
        : (ep.abi as typeof entryPoint07Abi),
    client: client as unknown as PublicClient,
    address: ep.address,
  });

  const balance = await entryPointContract.read.balanceOf([
    client.account!.address,
  ]);

  if (balance > 0n) {
    const hash = await client.sendUserOperation({
      calls: [
        {
          to: ep.address,
          data: encodeFunctionData({
            abi: entryPointContract.abi,
            functionName: "withdrawTo",
            args: [client.account!.address, balance],
          }),
        },
      ],
      account: client.account!,
    });

    await client.waitForUserOperationReceipt({ hash });
  }

  await setBalance(testClient as TestClient, {
    address: client.account!.address,
    value: 0n,
  });
}
