import type { z } from "zod";
import { UserOpConfigJsonSchema, UserOpConfigSchema } from "./schema.js";

export type UserOpConfigJson = z.infer<typeof UserOpConfigJsonSchema>;

export type UserOpConfig = z.infer<typeof UserOpConfigSchema>;
