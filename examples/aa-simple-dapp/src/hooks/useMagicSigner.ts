import { magicApiKey } from "@/config/client";
import { MagicSigner } from "@alchemy/aa-signers";

export const useMagicSigner = () => {
  if (typeof window === "undefined") {
    return { signer: null };
  }

  const magicSigner = new MagicSigner({ apiKey: magicApiKey });

  return { signer: magicSigner };
};
