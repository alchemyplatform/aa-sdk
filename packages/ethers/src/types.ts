import { z } from "zod";
import type { EthersProviderAdapterOptsSchema } from "./schema";

export type EthersProviderAdapterOpts = z.input<
  typeof EthersProviderAdapterOptsSchema
>;
