import { z } from "zod";
import {
  BaseAlchemySigner,
  SessionManagerParamsSchema,
} from "@account-kit/signer";
// eslint-disable-next-line import/extensions
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

class RNAlchemySignerSingleton extends BaseAlchemySigner<RNSignerClient> {
  private static instance: BaseAlchemySigner<RNSignerClient>;

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
  }

  public static getInstance(params: RNAlchemySignerParams) {
    if (!this.instance) {
      this.instance = new RNAlchemySignerSingleton(params);
    }
    return this.instance;
  }
}

export function RNAlchemySigner(params: RNAlchemySignerParams) {
  const instance = RNAlchemySignerSingleton.getInstance(params);

  return instance;
}
