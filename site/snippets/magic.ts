import { WalletClientSigner } from "@alchemy/aa-core";
import { Magic } from "magic-sdk";
import { createWalletClient, custom } from "viem";

// this is generated from the [Magic Dashboard](https://dashboard.magic.link/)
const MAGIC_API_KEY = "pk_test_...";

// instantiate Magic SDK instance
export const magic = new Magic(MAGIC_API_KEY);

// NOTE: because this is async, you will need to put this in a useEffect hook if using React
export const createMagicSigner = async () => {
  // 1. Authenticate the user (for other methods see magic docs https://magic.link/docs/dedicated/overview)
  await magic.wallet.connectWithUI();

  // 2. create a wallet client
  const magicClient = createWalletClient({
    transport: custom(await magic.wallet.getProvider()),
  });

  return new WalletClientSigner(
    magicClient,
    "magic" // signerType
  );
};
