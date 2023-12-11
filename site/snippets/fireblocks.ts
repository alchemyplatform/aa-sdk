import { FireblocksSigner } from "@alchemy/aa-signers";
import { ChainId } from "@fireblocks/fireblocks-web3-provider";

export const createFireblocksSigner = async () => {
  const fireblocksSigner = new FireblocksSigner({
    privateKey: process.env.FIREBLOCKS_API_PRIVATE_KEY_PATH!,
    apiKey: process.env.FIREBLOCKS_API_KEY!,
    vaultAccountIds: process.env.FIREBLOCKS_VAULT_ACCOUNT_IDS,
    chainId: ChainId.SEPOLIA,
  });

  await fireblocksSigner.authenticate();

  return fireblocksSigner;
};
