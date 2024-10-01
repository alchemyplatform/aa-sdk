import { z } from "zod";
import { BaseAlchemySigner } from "./base.js";
import {
  AlchemySignerClientParamsSchema,
  AlchemySignerWebClient,
} from "./client/index.js";
import type { CredentialCreationOptionOverrides } from "./client/types.js";
import { SessionManagerParamsSchema } from "./session/manager.js";

export type AuthParams =
  | { type: "email"; email: string; redirectParams?: URLSearchParams }
  | { type: "email"; bundle: string; orgId?: string }
  | {
      type: "passkey";
      email: string;
      creationOpts?: CredentialCreationOptionOverrides;
    }
  | {
      type: "passkey";
      createNew: false;
    }
  | {
      type: "passkey";
      createNew: true;
      username: string;
      creationOpts?: CredentialCreationOptionOverrides;
    }
  | ({
      type: "oauth";
      scope?: string;
      claims?: string;
    } & OauthProviderConfig &
      OauthRedirectConfig)
  | { type: "oauthReturn"; bundle: string; orgId: string };

export type OauthProviderConfig =
  | {
      authProviderId: "auth0";
      isCustomProvider?: false;
      auth0Connection?: string;
    }
  | {
      authProviderId: KnownAuthProvider;
      isCustomProvider?: false;
      auth0Connection?: never;
    }
  | {
      authProviderId: string;
      isCustomProvider: true;
      auth0Connection?: never;
    };

export type OauthRedirectConfig =
  | { mode: "redirect"; redirectUrl: string }
  | { mode: "popup"; redirectUrl?: never };

export type KnownAuthProvider = "google" | "apple" | "facebook" | "auth0";

export type OauthMode = "redirect" | "popup";

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
export class AlchemyWebSigner extends BaseAlchemySigner<AlchemySignerWebClient> {
  /**
   * Initializes an instance with the provided Alchemy signer parameters after parsing them with a schema.
   *
   * @example
   * ```ts
   * import { AlchemyWebSigner } from "@account-kit/signer";
   *
   * const signer = new AlchemyWebSigner({
   *  client: {
   *    connection: {
   *      rpcUrl: "/api/rpc",
   *    },
   *    iframeConfig: {
   *      iframeContainerId: "alchemy-signer-iframe-container",
   *    },
   *  },
   * });
   * ```
   *
   * @param {AlchemySignerParams} params The parameters for the Alchemy signer, including the client and session configuration
   */
  constructor(params: AlchemySignerParams) {
    const { sessionConfig, ...params_ } =
      AlchemySignerParamsSchema.parse(params);

    let client: AlchemySignerWebClient;
    if ("connection" in params_.client) {
      client = new AlchemySignerWebClient(params_.client);
    } else {
      client = params_.client;
    }
    super({
      client,
      sessionConfig,
    });
  }
}
