import { z } from "zod";
import {
  LightAccountAlchemyProviderConfigSchema,
  LightAccountProviderConfigSchema,
} from "./schema.js";

export type LightAccountAlchemyProviderConfig = z.infer<
  typeof LightAccountAlchemyProviderConfigSchema
>;

export type LightAccountProviderConfig = z.infer<
  typeof LightAccountProviderConfigSchema
>;
