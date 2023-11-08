import { z } from "zod";
import type { EthersProviderAdapterOptsSchema } from "./schema";

export type EthersProviderAdapterOpts = z.infer<
  typeof EthersProviderAdapterOptsSchema
>;
