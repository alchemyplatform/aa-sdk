import { z } from "zod";
import { BaseAlchemySigner } from "./base.js";
import {
  AlchemySignerClientParamsSchema,
  AlchemySignerWebClient,
} from "./client/index.js";
import type { CredentialCreationOptionOverrides } from "./client/types.js";
import { SessionManagerParamsSchema } from "./session/manager.js";

export type AuthParams =
  | {
      type: "email";
      email: string;
      /** @deprecated This option will be overriden by dashboard settings. Please use the dashboard settings instead. This option will be removed in a future release. */
      emailMode?: "magicLink" | "otp";
      redirectParams?: URLSearchParams;
    }
  | { type: "email"; bundle: string; orgId?: string; isNewUser?: boolean }
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
      otherParameters?: Record<string, string>;
    } & OauthProviderConfig &
      OauthRedirectConfig)
  | ({
      type: "custom-jwt";
      jwt: string;
    } & OauthProviderConfig)
  | {
      type: "oauthReturn";
      bundle: string;
      orgId: string;
      idToken: string;
      isNewUser?: boolean;
    }
  | {
      type: "otp";
      otpCode: string;
    };

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

export type KnownAuthProvider =
  | "google"
  | "apple"
  | "facebook"
  | "twitch"
  | "auth0";

export type OauthMode = "redirect" | "popup";

export const AlchemySignerParamsSchema = z
  .object({
    client: z
      .custom<AlchemySignerWebClient>()
      .or(AlchemySignerClientParamsSchema),
  })
  .extend({
    sessionConfig: SessionManagerParamsSchema.omit({
      client: true,
    }).optional(),
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
    const {
      emailBundle,
      oauthBundle,
      oauthOrgId,
      oauthError,
      idToken,
      isSignup,
    } = getAndRemoveQueryParams({
      emailBundle: "bundle",
      // We don't need this, but we still want to remove it from the URL.
      emailOrgId: "orgId",
      oauthBundle: "alchemy-bundle",
      oauthOrgId: "alchemy-org-id",
      oauthError: "alchemy-error",
      idToken: "alchemy-id-token",
      isSignup: "aa-is-signup",
    });

    const initialError =
      oauthError != null
        ? { name: "OauthError", message: oauthError }
        : undefined;

    super({ client, sessionConfig, initialError });

    const isNewUser = isSignup === "true";

    this.signerType = "alchemy-signer";

    if (emailBundle) {
      this.authenticate({
        type: "email",
        bundle: emailBundle,
        isNewUser,
      });
    } else if (oauthBundle && oauthOrgId && idToken) {
      this.authenticate({
        type: "oauthReturn",
        bundle: oauthBundle,
        orgId: oauthOrgId,
        idToken,
        isNewUser,
      });
    }
  }
}

/**
 * Reads and removes the specified query params from the URL.
 *
 * @param {T} keys object whose values are the query parameter keys to read and
 * remove
 * @returns {{ [K in keyof T]: string | undefined }} object with the same keys
 * as the input whose values are the values of the query params.
 */
function getAndRemoveQueryParams<T extends Record<string, string>>(
  keys: T
): { [K in keyof T]: string | undefined } {
  const url = new URL(window.location.href);
  const result: Record<string, string | undefined> = {};
  let foundQueryParam = false;
  for (const [key, param] of Object.entries(keys)) {
    const value = url.searchParams.get(param) ?? undefined;
    foundQueryParam ||= value != null;
    result[key] = value;
    url.searchParams.delete(param);
  }
  if (foundQueryParam) {
    window.history.replaceState(window.history.state, "", url.toString());
  }
  return result as { [K in keyof T]: string | undefined };
}
