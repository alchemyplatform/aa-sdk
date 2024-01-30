import { sepolia } from "@alchemy/aa-core";
import { CapsuleSigner } from "@alchemy/aa-signers/capsule";
import { Environment } from "@usecapsule/web-sdk";
import { http } from "viem";

export const createCapsuleSigner = async () => {
  // get an API Key by filling out this form: https://form.typeform.com/to/hLaJeYJW
  const capsuleSigner = new CapsuleSigner({
    env: Environment.DEVELOPMENT,
    apiKey: "CAPSULE_API_KEY",
    walletConfig: {
      chain: sepolia,
      // get your own Alchemy API key at: https://dashboard.alchemy.com/
      transport: http(`${sepolia.rpcUrls.alchemy.http[0]}/ALCHEMY_API_KEY`),
    },
  });

  await capsuleSigner.authenticate();

  return capsuleSigner;
};
