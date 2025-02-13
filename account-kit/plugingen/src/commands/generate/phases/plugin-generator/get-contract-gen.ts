import dedent from "dedent";
import type { Phase } from "../../types";

export const GetContractGenPhase: Phase = async (input) => {
  const { content, pluginConfig, addImport } = input;

  addImport("viem", { name: "getContract", isType: false });
  addImport("viem", { name: "GetContractReturnType", isType: true });
  addImport("viem", { name: "Address", isType: true });
  addImport("viem", { name: "Transport", isType: true });
  addImport("viem", { name: "PublicClient", isType: true });
  addImport("viem", { name: "Client", isType: true });
  addImport("@aa-sdk/core", { name: "ChainNotFoundError" });

  content.push(dedent`
  getContract: <C extends Client>(
    client: C,
    address?: Address
  ): GetContractReturnType<typeof ${pluginConfig.name}Abi, PublicClient, Address> => {
      if (!client.chain) throw new ChainNotFoundError();

      return getContract({
        address: address || addresses[client.chain.id],
        abi: ${pluginConfig.name}Abi,
        client: client,
      }) as GetContractReturnType<typeof ${pluginConfig.name}Abi, PublicClient, Address>;
  }`);

  return input;
};
