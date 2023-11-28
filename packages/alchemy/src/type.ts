import { z } from "zod";
import type {
  AlchemyProviderConfigSchema,
  ConnectionConfigSchema,
} from "./schema";

export type ConnectionConfig = z.infer<typeof ConnectionConfigSchema>;

export type AlchemyProviderConfig = z.infer<typeof AlchemyProviderConfigSchema>;
