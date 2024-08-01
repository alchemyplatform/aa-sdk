import { z } from "zod";
import type { AlchemyProviderConfigSchema } from "./schema.js";

export type AlchemyProviderConfig = z.input<typeof AlchemyProviderConfigSchema>;
