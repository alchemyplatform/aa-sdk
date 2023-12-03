import { z } from "zod";
import type {
  AlchemyProviderConfigSchema,
  ConnectionConfigSchema,
  LightAccountAlchemyProviderConfigSchema,
} from "./schema.js";

export type ConnectionConfig = z.input<typeof ConnectionConfigSchema>;

export type AlchemyProviderConfig = z.input<typeof AlchemyProviderConfigSchema>;

export type LightAccountAlchemyProviderConfig = z.input<
  typeof LightAccountAlchemyProviderConfigSchema
>;
