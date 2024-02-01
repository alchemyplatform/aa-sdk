import { z } from "zod";
import type { AlchemySmartAccountClientConfigSchema } from "./schema.js";

export type AlchemySmartAccountClientConfig = z.input<
  typeof AlchemySmartAccountClientConfigSchema
>;
