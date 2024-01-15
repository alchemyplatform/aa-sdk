import dedent from "dedent";
import type { Phase } from "../../types";

export const GetContractGenPhase: Phase = async (input) => {
  const { content, contract, addImport } = input;

  addImport("viem", { name: "getContract", isType: false });
  addImport("viem", { name: "GetContractReturnType", isType: true });
  addImport("viem", { name: "Address", isType: true });
  content.push(dedent`
  getContract: (
    provider: ISmartAccountProvider,
    address?: Address
  ): GetContractReturnType<typeof ${contract.name}Abi, typeof provider.rpcClient, undefined, Address> =>
    getContract({
      address: address || addresses[provider.rpcClient.chain.id],
      abi: ${contract.name}Abi,
      publicClient: provider.rpcClient,
    })
  `);

  return input;
};
