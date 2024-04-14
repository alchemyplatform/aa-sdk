import {
  BigNumberishSchema,
  ChainSchema,
  HexSchema,
  MultiplierSchema,
  type EntryPointVersion,
} from "@alchemy/aa-core";
import { Address } from "abitype/zod";
import { z } from "zod";

export const UserOperationCallDataSchema = z.union([
  z
    .object({
      target: Address,
      data: HexSchema,
      value: z.bigint().optional(),
    })
    .strict(),
  HexSchema,
]);

export const BatchUserOperationCallDataSchema = z.array(
  z
    .object({
      target: Address,
      data: HexSchema,
      value: z.bigint().optional(),
    })
    .strict()
);

export const UserOperationPaymasterOverridesSchema = (
  entryPointVersion: EntryPointVersion
) =>
  entryPointVersion === "0.7.0"
    ? z
        .object({
          paymaster: Address,
          paymasterData: HexSchema,
          paymasterPostOpGasLimit: z.union([
            BigNumberishSchema,
            MultiplierSchema,
          ]),
          paymasterVerificationGasLimit: z.union([
            BigNumberishSchema,
            MultiplierSchema,
          ]),
        })
        .strict()
    : z
        .object({
          paymasterAndData: HexSchema,
        })
        .strict();

export const UserOperationOverridesSchema = (
  entryPointVersion: EntryPointVersion
) =>
  entryPointVersion === "0.7.0"
    ? z
        .object({
          maxFeePerGas: z.union([BigNumberishSchema, MultiplierSchema]),
          maxPriorityFeePerGas: z.union([BigNumberishSchema, MultiplierSchema]),
          callGasLimit: z.union([BigNumberishSchema, MultiplierSchema]),
          verificationGasLimit: z.union([BigNumberishSchema, MultiplierSchema]),
          preVerificationGas: z.union([BigNumberishSchema, MultiplierSchema]),
          nonceKey: z.bigint(),
          paymaster: Address,
          paymasterData: HexSchema,
          paymasterPostOpGasLimit: z.union([
            BigNumberishSchema,
            MultiplierSchema,
          ]),
          paymasterVerificationGasLimit: z.union([
            BigNumberishSchema,
            MultiplierSchema,
          ]),
        })
        .partial()
    : z
        .object({
          maxFeePerGas: z.union([BigNumberishSchema, MultiplierSchema]),
          maxPriorityFeePerGas: z.union([BigNumberishSchema, MultiplierSchema]),
          callGasLimit: z.union([BigNumberishSchema, MultiplierSchema]),
          verificationGasLimit: z.union([BigNumberishSchema, MultiplierSchema]),
          preVerificationGas: z.union([BigNumberishSchema, MultiplierSchema]),
          nonceKey: z.bigint(),
          paymasterAndData: HexSchema,
        })
        .partial();

export const createUserOpConfigSchema = (
  entryPointVersion: EntryPointVersion
) =>
  z.object({
    chain: ChainSchema,

    connection_config: z.union([
      z.string().url(),
      z.object({
        bundler: z.string().url(),
        public: z.string().url(),
      }),
    ]),

    entrypoint: z.literal(entryPointVersion),

    account: z.object({
      owner: z.union([z.string(), HexSchema]),
      type: z.union([
        z.literal("SimpleSmartAccount"),
        z.literal("LightAccount"),
        z.literal("MultiOwnerModularAccount"),
        z.literal("MultisigModularAccount"),
      ]),
    }),

    userop: z.object({
      calldata: z.union([
        UserOperationCallDataSchema,
        BatchUserOperationCallDataSchema,
      ]),
      overrides: UserOperationOverridesSchema(entryPointVersion).optional(),
    }),
  });

export const createUserOpConfigJsonSchema = (
  entryPointVersion: EntryPointVersion
) =>
  createUserOpConfigSchema(entryPointVersion)
    .omit({ chain: true })
    .extend({
      chain: z.union([z.string(), z.number()]),
    });

export const UserOpConfigJsonSchema = z.union([
  createUserOpConfigJsonSchema("0.6.0"),
  createUserOpConfigJsonSchema("0.7.0"),
]);

export const UserOpConfigSchema = z.union([
  createUserOpConfigSchema("0.6.0"),
  createUserOpConfigSchema("0.7.0"),
]);
