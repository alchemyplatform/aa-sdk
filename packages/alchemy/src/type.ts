import { z } from "zod";
import type {
  AlchemyProviderConfigSchema,
  ConnectionConfigSchema,
  LightAccountAlchemyProviderConfigSchema,
} from "./schema.js";

export type ConnectionConfig = z.infer<typeof ConnectionConfigSchema>;

export type AlchemyProviderConfig = z.infer<typeof AlchemyProviderConfigSchema>;

export type LightAccountAlchemyProviderConfig = z.infer<
  typeof LightAccountAlchemyProviderConfigSchema
>;
