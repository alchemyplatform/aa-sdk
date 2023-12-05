import { z } from "zod";
import { NaniAccountProviderConfigSchema } from "./schema.js";

export type NaniAccountProviderConfig = z.input<
  typeof NaniAccountProviderConfigSchema
>;
