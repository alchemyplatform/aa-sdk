import { z } from "zod";
import { BaseAlchemySigner } from "./base.js";
import {
  AlchemySignerClientParamsSchema,
  AlchemySignerWebClient,
} from "./client/index.js";
import type {
  AuthLinkingPrompt,
  CredentialCreationOptionOverrides,
  VerifyMfaParams,
} from "./client/types.js";
import { SessionManagerParamsSchema } from "./session/manager.js";

export type AuthParams =
  | {
      type: "email";
      email: string;
      /** @deprecated This option will be overriden by dashboard settings. Please use the dashboard settings instead. This option will be removed in a future release. */
      emailMode?: "magicLink" | "otp";
      redirectParams?: URLSearchParams;
      multiFactors?: VerifyMfaParams[];
    }
  | { type: "email"; bundle: string; orgId?: string; isNewUser?: boolean }
  | {
      type: "sms";
      phone: string;
    }
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
  | {
      type: "oauthReturn";
      bundle: string;
      orgId: string;
      idToken: string;
      isNewUser?: boolean;
    }
  | ({
      type: "custom-jwt";
      jwt: string;
    } & OauthProviderConfig)
  | {
      type: "otp";
      otpCode: string;
      multiFactors?: VerifyMfaParams[];
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
  private static replaceStateFilterInstalled = false;
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

    const qpStructure = {
      emailBundle: "bundle",
      // We don't need this, but we still want to remove it from the URL.
      emailOrgId: "orgId",
      status: "alchemy-status",
      oauthBundle: "alchemy-bundle",
      oauthOrgId: "alchemy-org-id",
      idToken: "alchemy-id-token",
      isSignup: "aa-is-signup",
      otpId: "alchemy-otp-id",
      email: "alchemy-email",
      authProvider: "alchemy-auth-provider",
      oauthError: "alchemy-error",
    };

    const {
      emailBundle,
      status,
      oauthBundle,
      oauthOrgId,
      idToken,
      isSignup,
      otpId,
      email,
      authProvider,
      oauthError,
    } = getAndRemoveQueryParams(qpStructure);

    if (!AlchemyWebSigner.replaceStateFilterInstalled) {
      installReplaceStateFilter(Object.values(qpStructure));
      AlchemyWebSigner.replaceStateFilterInstalled = true;
    }

    const initialError =
      oauthError != null
        ? { name: "OauthError", message: oauthError }
        : undefined;

    const initialAuthLinkingPrompt: AuthLinkingPrompt | undefined = (() => {
      if (status !== "ACCOUNT_LINKING_CONFIRMATION_REQUIRED") {
        return undefined;
      }
      if (
        idToken == null ||
        email == null ||
        authProvider == null ||
        otpId == null ||
        oauthOrgId == null
      ) {
        console.error("Missing required query params for auth linking prompt");
        return undefined;
      }
      return {
        status,
        idToken,
        email,
        providerName: authProvider,
        otpId,
        orgId: oauthOrgId,
      };
    })();

    super({ client, sessionConfig, initialError, initialAuthLinkingPrompt });

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
 * Overrides `window.history.replaceState` to remove the specified query params from target URLs.
 *
 * @param {string[]} qpToRemove The query params to remove from target URLs.
 */
function installReplaceStateFilter(qpToRemove: string[]) {
  const originalReplaceState = window.history.replaceState;

  const processUrl = (src: string | URL | undefined | null) => {
    if (!src) {
      return src;
    }

    try {
      const url = new URL(src, document.baseURI);
      const originalSearch = url.search;

      qpToRemove.forEach((qp) => url.searchParams.delete(qp));
      if (originalSearch === url.search) return src;

      console.log("[Alchemy] filtered query params from URL");
      return url;
    } catch (e) {
      console.log("[Alchemy] failed to process URL in state filter", e);
      return src;
    }
  };

  window.history.replaceState = function (...args) {
    const [state, unused, url] = args;

    const result = originalReplaceState.apply(this, [
      state,
      unused,
      processUrl(url),
    ]);

    return result;
  };

  console.log("[Alchemy] installed window.history.replaceState interceptor");
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
  keys: T,
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
