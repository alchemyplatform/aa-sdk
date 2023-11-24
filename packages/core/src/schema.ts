import { z } from "zod";
import { BigNumberishRangeSchema, PercentageSchema } from "./utils/index.js";

export const UserOperationFeeOptionsFieldSchema =
  BigNumberishRangeSchema.merge(PercentageSchema).partial();

export const UserOperationFeeOptionsSchema = z
  .object({
    maxFeePerGas: UserOperationFeeOptionsFieldSchema,
    maxPriorityFeePerGas: UserOperationFeeOptionsFieldSchema,
    callGasLimit: UserOperationFeeOptionsFieldSchema,
    verificationGasLimit: UserOperationFeeOptionsFieldSchema,
    preVerificationGas: UserOperationFeeOptionsFieldSchema,
  })
  .partial()
  .strict();
