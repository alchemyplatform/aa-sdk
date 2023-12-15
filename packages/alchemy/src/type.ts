import { z } from "zod";
import type {
  AlchemyProviderConfigSchema,
  LightAccountAlchemyProviderConfigSchema,
} from "./schema.js";

export type AlchemyProviderConfig = z.input<typeof AlchemyProviderConfigSchema>;

export type LightAccountAlchemyProviderConfig = z.input<
  typeof LightAccountAlchemyProviderConfigSchema
>;
