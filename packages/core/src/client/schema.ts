import type { Transport } from "viem";
import { z } from "zod";
import type { PublicErc4337Client, SupportedTransports } from "./types";

export const createPublicErc4337ClientSchema = <
  TTransport extends SupportedTransports = Transport
>() =>
  z.custom<PublicErc4337Client<TTransport>>((provider) => {
    return (
      provider != null &&
      typeof provider === "object" &&
      "request" in provider &&
      "type" in provider &&
      "key" in provider &&
      "name" in provider
    );
  });
