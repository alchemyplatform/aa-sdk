import { z } from "zod";
import { BaseAlchemySigner } from "./base.js";
import {
  AlchemySignerClientParamsSchema,
  AlchemySignerWebClient,
} from "./client/index.js";
import type { CredentialCreationOptionOverrides } from "./client/types";
import { SessionManagerParamsSchema } from "./session/manager.js";

export type AuthParams =
  | { type: "email"; email: string; redirectParams?: URLSearchParams }
  | { type: "email"; bundle: string; orgId?: string }
  | {
      type: "passkey";
      createNew: false;
    }
  | {
      type: "passkey";
      createNew: true;
      username: string;
      creationOpts?: CredentialCreationOptionOverrides;
    };

export const AlchemySignerParamsSchema = z
  .object({
    client: z
      .custom<AlchemySignerWebClient>()
      .or(AlchemySignerClientParamsSchema),
  })
  .extend({
    sessionConfig: SessionManagerParamsSchema.omit({ client: true }).optional(),
  });

export type AlchemySignerParams = z.input<typeof AlchemySignerParamsSchema>;

/**
 * A SmartAccountSigner that can be used with any SmartContractAccount
 */
export class AlchemySigner extends BaseAlchemySigner<AlchemySignerWebClient> {
  constructor(params_: AlchemySignerParams) {
    const { sessionConfig, ...params } =
      AlchemySignerParamsSchema.parse(params_);

    let client: AlchemySignerWebClient;
    if ("connection" in params.client) {
      client = new AlchemySignerWebClient(params.client);
    } else {
      client = params.client;
    }
    super({
      client,
      sessionConfig,
    });
  }
}
