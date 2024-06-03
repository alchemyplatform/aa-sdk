import type { Anvil } from "@viem/anvil";
import { z } from "zod";
import { getRundlerBinaryPath } from "./utils.js";

export type Rundler = {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  anvil: Anvil;
  readonly port: number;
  readonly host: string;
  readonly logs: string[];
};

export const RundlerOptionsSchema = z.object({
  rpc: z
    .object({
      port: z.number().default(3000),
      host: z.string().default("127.0.0.1"),
    })
    .default({}),
  max_verification_gas: z.number().default(10000000),
  node_http: z.string().default("http://localhost:8545"),
  builder: z
    .object({
      private_key: z
        .string()
        .default(
          "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
        ),
    })
    .default({}),
});

export const RundlerCreationOptionsSchema = z
  .object({
    binaryPath: z.string().default(getRundlerBinaryPath()),
  })
  .and(RundlerOptionsSchema);

export type RundlerCreationOptions = z.input<
  typeof RundlerCreationOptionsSchema
>;

export type RundlerOptions = z.input<typeof RundlerOptionsSchema>;
