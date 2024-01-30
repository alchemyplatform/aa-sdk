import { AlchemyProvider } from "@alchemy/aa-alchemy";
import { sepolia } from "@alchemy/aa-core";

export const provider = new AlchemyProvider({
  apiKey: "ALCHEMY_API_KEY", // replace with your Alchemy API Key
  chain: sepolia,
});
