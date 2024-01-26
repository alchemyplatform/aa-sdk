import dedent from "dedent";
import type { Phase } from "../../types";

export const GetContractGenPhase: Phase = async (input) => {
  const { content, contract, addImport } = input;

  addImport("@alchemy/aa-core", { name: "PublicErc4337Client", isType: true });
  addImport("viem", { name: "getContract", isType: false });
  addImport("viem", { name: "GetContractReturnType", isType: true });
  addImport("viem", { name: "Address", isType: true });
  addImport("viem", { name: "HttpTransport", isType: true });
  addImport("viem", { name: "Transport", isType: true });

  content.push(dedent`
  getContract: (
    rpcClient:
      | PublicErc4337Client<HttpTransport>
      | PublicErc4337Client<Transport>,
    address?: Address
  ): GetContractReturnType<typeof ${contract.name}Abi, typeof rpcClient, undefined, Address> =>
    getContract({
      address: address || addresses[rpcClient.chain.id],
      abi: ${contract.name}Abi,
      publicClient: rpcClient,
    })
  `);

  return input;
};
