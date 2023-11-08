import { z } from "zod";
import type { createEthersProviderAdapterOptsSchema } from "./schema";

export type EthersProviderAdapterOpts<SignerClient extends any = any> = z.infer<
  ReturnType<typeof createEthersProviderAdapterOptsSchema<SignerClient>>
>;
