import { z } from "zod";
import { LightAccountProviderConfigSchema } from "./schema.js";

export type LightAccountProviderConfig = z.input<
  typeof LightAccountProviderConfigSchema
>;
