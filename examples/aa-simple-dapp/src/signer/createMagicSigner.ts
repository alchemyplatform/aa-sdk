"use client";
import { magicApiKey } from "@/config/client";

export const createMagicSigner = async () => {
  if (typeof window === "undefined") {
    return null;
  }

  const { MagicSigner } = await import("@alchemy/aa-signers/magic");

  const magicSigner = new MagicSigner({ apiKey: magicApiKey });

  return magicSigner;
};
