/* eslint-disable import/extensions */
import {
  BaseAlchemySigner,
  SessionManagerParamsSchema,
} from "@account-kit/signer";
import { z } from "zod";
import { RNSignerClient, RNSignerClientParamsSchema } from "./client";

const RNAlchemySignerParamsSchema = z
  .object({
    client: z.custom<RNSignerClient>().or(RNSignerClientParamsSchema),
  })
  .extend({
    sessionConfig: SessionManagerParamsSchema.omit({
      client: true,
      storage: true,
    }).optional(),
  });

export type RNAlchemySignerParams = z.input<typeof RNAlchemySignerParamsSchema>;

export class RNAlchemySignerSingleton extends BaseAlchemySigner<RNSignerClient> {
  private static instance: RNAlchemySignerSingleton;

  private constructor(params: RNAlchemySignerParams) {
    if (!!RNAlchemySignerSingleton.instance) {
      return RNAlchemySignerSingleton.instance;
    }

    const { sessionConfig, ...params_ } =
      RNAlchemySignerParamsSchema.parse(params);

    let client: RNSignerClient;

    if ("connection" in params_.client) {
      client = new RNSignerClient(params_.client);
    } else {
      client = params_.client;
    }

    super({
      client,
      sessionConfig,
    });

    this.signerType = "rn-alchemy-signer";
  }

  public static getInstance(params: RNAlchemySignerParams) {
    if (!this.instance) {
      this.instance = new RNAlchemySignerSingleton(params);
    }
    return this.instance;
  }

  /**
   * Exports the wallet and returns the decrypted private key or seed phrase.
   * This is the recommended method for React Native apps.
   * 
   * @param {import("./client").ExportWalletParams} params Export parameters
   * @returns {Promise<import("./client").ExportWalletResult>} The decrypted export data
   * @throws {Error} If the user is not authenticated or export fails
   */
  async exportWalletWithResult(params?: import("./client").ExportWalletParams) {
    return this.inner.exportWalletWithResult(params);
  }
}

/**
 * Factory function to create or retrieve a singleton instance of RNAlchemySigner.
 *
 * @example
 * ```ts twoslash
 * import { RNAlchemySigner } from "@account-kit/react-native-signer";
 *
 * const signer = RNAlchemySigner({
 *  client: {
 *    connection: {
 *      apiKey: "YOUR_API_KEY"
 *    },
 *  },
 *  // optional config to override default session manager configs
 *  sessionConfig: {
 *    expirationTimeMs: 1000 * 60 * 60 // 60 minutes
 *  }
 * });
 * ```
 *
 * @param {RNAlchemySignerParams} params The parameters required to configure the RNAlchemySigner instance.
 * @returns {RNAlchemySignerSingleton} The singleton instance of RNAlchemySigner configured with the provided parameters.
 */
export function RNAlchemySigner(params: RNAlchemySignerParams) {
  const instance = RNAlchemySignerSingleton.getInstance(params);

  return instance;
}

export type RNAlchemySignerType = RNAlchemySignerSingleton;
