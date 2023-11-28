import { MagicSigner } from "@alchemy/aa-signers";

// this is generated from the [Magic Dashboard](https://dashboard.magic.link/)
const MAGIC_API_KEY = "pk_test_...";

export const createMagicSigner = async () => {
  const magicSigner = new MagicSigner({ apiKey: MAGIC_API_KEY });

  await magicSigner.authenticate({
    authenticate: async () => {
      await magicSigner.inner.wallet.connectWithUI();
    },
  });

  return magicSigner;
};
