import { z } from "zod";
import type {
  AlchemyProviderConfigSchema,
  ConnectionConfigSchema,
  FeeOptsSchema,
} from "./schema";

export type ConnectionConfig = z.infer<typeof ConnectionConfigSchema>;

export type FeeOpts = z.infer<typeof FeeOptsSchema>;

export type AlchemyProviderConfig = z.infer<typeof AlchemyProviderConfigSchema>;
