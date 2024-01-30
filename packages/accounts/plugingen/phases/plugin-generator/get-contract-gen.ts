import dedent from "dedent";
import type { Phase } from "../../types";

export const GetContractGenPhase: Phase = async (input) => {
  const { content, contract, addImport } = input;

  addImport("@alchemy/aa-core", {
    name: "SmartAccountClient",
    isType: true,
  });
  addImport("viem", { name: "getContract", isType: false });
  addImport("viem", { name: "GetContractReturnType", isType: true });
  addImport("viem", { name: "Address", isType: true });
  addImport("viem", { name: "Transport", isType: true });
  addImport("viem", { name: "PublicClient", isType: true });
  addImport("viem", { name: "Client", isType: true });

  content.push(dedent`
  getContract: <C extends Client>(
    client: C,
    address?: Address
  ): GetContractReturnType<typeof ${contract.name}Abi, PublicClient, Address> => {
      if (!client.chain) throw new Error("Missing chain on client");

      return getContract({
        address: address || addresses[client.chain.id],
        abi: ${contract.name}Abi,
        client: client,
      });
  }`);

  return input;
};
