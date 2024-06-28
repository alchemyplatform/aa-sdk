import { ConnectionConfigSchema } from "@aa-sdk/core";
import { getWebAuthnAttestation } from "@turnkey/http";
import { IframeStamper } from "@turnkey/iframe-stamper";
import { WebauthnStamper } from "@turnkey/webauthn-stamper";
import { z } from "zod";
import { base64UrlEncode } from "../utils/base64UrlEncode.js";
import { generateRandomBuffer } from "../utils/generateRandomBuffer.js";
import { BaseSignerClient } from "./base.js";
import type {
  CreateAccountParams,
  CredentialCreationOptionOverrides,
  EmailAuthParams,
  ExportWalletParams,
  User,
} from "./types.js";

export const AlchemySignerClientParamsSchema = z.object({
  connection: ConnectionConfigSchema,
  iframeConfig: z.object({
    iframeElementId: z.string().default("turnkey-iframe"),
    iframeContainerId: z.string(),
  }),
  rpId: z.string().optional(),
  rootOrgId: z
    .string()
    .optional()
    .default("24c1acf5-810f-41e0-a503-d5d13fa8e830"),
});

export type AlchemySignerClientParams = z.input<
  typeof AlchemySignerClientParamsSchema
>;

/**
 * A lower level client used by the AlchemySigner used to communicate with
 * Alchemy's signer service.
 */
export class AlchemySignerWebClient extends BaseSignerClient<ExportWalletParams> {
  private iframeStamper: IframeStamper;
  private webauthnStamper: WebauthnStamper;
  iframeContainerId: string;

  /**
   * Initializes a new instance with the given parameters, setting up the connection, iframe configuration, and WebAuthn stamper.
   *
   * @example
   * ```ts
   * import { AlchemySignerWebClient } from "@account-kit/signer";
   *
   * const client = new AlchemySignerWebClient({
   *  connection: {
   *    apiKey: "your-api-key",
   *  },
   *  iframeConfig: {
   *   iframeContainerId: "signer-iframe-container",
   *  },
   * });
   * ```
   *
   * @param {AlchemySignerClientParams} params the parameters required to initialize the client
   * @param {ConnectionConfig} params.connection The connection details needed to connect to the service
   * @param {object} params.iframeConfig The configuration details for setting up the iframe stamper
   * @param {string} params.iframeConfig.iframeElementId The element ID of the iframe
   * @param {string} params.iframeConfig.iframeContainerId The container ID for the iframe element
   * @param {string} [params.rpId] The relying party ID, defaulting to the current hostname if not provided
   * @param {string} params.rootOrgId The root organization ID
   */
  constructor(params: AlchemySignerClientParams) {
    const { connection, iframeConfig, rpId, rootOrgId } =
      AlchemySignerClientParamsSchema.parse(params);

    const iframeStamper = new IframeStamper({
      iframeElementId: iframeConfig.iframeElementId,
      iframeUrl: "https://auth.turnkey.com",
      iframeContainer: document.getElementById(iframeConfig.iframeContainerId),
    });

    super({
      connection,
      rootOrgId,
      stamper: iframeStamper,
    });

    this.iframeStamper = iframeStamper;
    this.iframeContainerId = iframeConfig.iframeContainerId;

    this.webauthnStamper = new WebauthnStamper({
      rpId: rpId ?? window.location.hostname,
    });
  }

  /**
   * Authenticates the user by either email or passkey account creation flow. Emits events during the process.
   *
   * @example
   * ```ts
   * import { AlchemySignerWebClient } from "@account-kit/signer";
   *
   * const client = new AlchemySignerWebClient({
   *  connection: {
   *    apiKey: "your-api-key",
   *  },
   *  iframeConfig: {
   *   iframeContainerId: "signer-iframe-container",
   *  },
   * });
   *
   * const account = await client.createAccount({ type: "email", email: "you@mail.com" });
   * ```
   *
   * @param {CreateAccountParams} params The parameters for creating an account, including the type (email or passkey) and additional details.
   * @returns {Promise<SignupResponse>} A promise that resolves with the response object containing the account creation result.
   */
  createAccount = async (params: CreateAccountParams) => {
    this.eventEmitter.emit("authenticating");
    if (params.type === "email") {
      const { email, expirationSeconds } = params;
      const publicKey = await this.initIframeStamper();

      const response = await this.request("/v1/signup", {
        email,
        targetPublicKey: publicKey,
        expirationSeconds,
        redirectParams: params.redirectParams?.toString(),
      });

      return response;
    }

    // Passkey account creation flow
    const { attestation, challenge } = await this.getWebAuthnAttestation(
      params.creationOpts,
      { username: params.username }
    );

    const result = await this.request("/v1/signup", {
      passkey: {
        challenge: base64UrlEncode(challenge),
        attestation,
      },
    });

    this.user = {
      orgId: result.orgId,
      address: result.address!,
      userId: result.userId!,
      credentialId: attestation.credentialId,
    };
    this.initWebauthnStamper(this.user);
    this.eventEmitter.emit("connectedPasskey", this.user);

    return result;
  };

  /**
   * Begin authenticating a user with their email and an expiration time for the authentication request. Initializes the iframe stamper to get the target public key.
   * This method sends an email to the user to complete their login
   *
   * @example
   * ```ts
   * import { AlchemySignerWebClient } from "@account-kit/signer";
   *
   * const client = new AlchemySignerWebClient({
   *  connection: {
   *    apiKey: "your-api-key",
   *  },
   *  iframeConfig: {
   *   iframeContainerId: "signer-iframe-container",
   *  },
   * });
   *
   * const account = await client.initEmailAuth({ email: "you@mail.com" });
   * ```
   *
   * @param {Omit<EmailAuthParams, "targetPublicKey">} params The parameters for email authentication, excluding the target public key
   * @returns {Promise<any>} The response from the authentication request
   */
  public initEmailAuth = async (
    params: Omit<EmailAuthParams, "targetPublicKey">
  ) => {
    this.eventEmitter.emit("authenticating");
    const { email, expirationSeconds } = params;
    const publicKey = await this.initIframeStamper();

    return this.request("/v1/auth", {
      email,
      targetPublicKey: publicKey,
      expirationSeconds,
      redirectParams: params.redirectParams?.toString(),
    });
  };

  /**
   * Completes email auth for the user by injecting a credential bundle and retrieving the user information based on the provided organization ID. Emits events during the process.
   *
   * @example
   * ```ts
   * import { AlchemySignerWebClient } from "@account-kit/signer";
   *
   * const client = new AlchemySignerWebClient({
   *  connection: {
   *    apiKey: "your-api-key",
   *  },
   *  iframeConfig: {
   *   iframeContainerId: "signer-iframe-container",
   *  },
   * });
   *
   * const account = await client.completeEmailAuth({ orgId: "user-org-id", bundle: "bundle-from-email" });
   * ```
   *
   * @param {object} config The configuration object for the authentication function
   * @param {string} config.bundle The credential bundle to be injected
   * @param {string} config.orgId The organization ID to retrieve the user information
   * @returns {Promise<User>} A promise that resolves to the authenticated user information
   */
  public completeEmailAuth = async ({
    bundle,
    orgId,
  }: {
    bundle: string;
    orgId: string;
  }) => {
    this.eventEmitter.emit("authenticating");
    await this.initIframeStamper();

    const result = await this.iframeStamper.injectCredentialBundle(bundle);

    if (!result) {
      throw new Error("Failed to inject credential bundle");
    }

    const user = await this.whoami(orgId);
    this.eventEmitter.emit("connectedEmail", user, bundle);

    return user;
  };

  /**
   * Asynchronously handles the authentication process using WebAuthn Stamper. If a user is provided, sets the user and returns it. Otherwise, retrieves the current user and initializes the WebAuthn stamper.
   *
   * @example
   * ```ts
   * import { AlchemySignerWebClient } from "@account-kit/signer";
   *
   * const client = new AlchemySignerWebClient({
   *  connection: {
   *    apiKey: "your-api-key",
   *  },
   *  iframeConfig: {
   *   iframeContainerId: "signer-iframe-container",
   *  },
   * });
   *
   * const account = await client.lookupUserWithPasskey();
   * ```
   *
   * @param {User} [user] An optional user object to authenticate
   * @returns {Promise<User>} A promise that resolves to the authenticated user object
   */
  public lookupUserWithPasskey = async (user: User | undefined = undefined) => {
    this.eventEmitter.emit("authenticating");
    await this.initWebauthnStamper(user);
    if (user) {
      this.user = user;
      return user;
    }

    const result = await this.whoami(this.rootOrg);
    await this.initWebauthnStamper(result);
    this.eventEmitter.emit("connectedPasskey", result);

    return result;
  };

  /**
   * Initiates the export of a wallet by creating an iframe stamper and calling the appropriate export function.
   * The export can be based on a seed phrase or a private key.
   *
   * @example
   * ```ts
   * import { AlchemySignerWebClient } from "@account-kit/signer";
   *
   * const client = new AlchemySignerWebClient({
   *  connection: {
   *    apiKey: "your-api-key",
   *  },
   *  iframeConfig: {
   *   iframeContainerId: "signer-iframe-container",
   *  },
   * });
   *
   * const account = await client.exportWallet({
   *  iframeContainerId: "export-iframe-container",
   * });
   * ```
   *
   * @param {ExportWalletParams} config The parameters for exporting the wallet
   * @param {string} config.iframeContainerId The ID of the container element that will hold the iframe stamper
   * @param {string} [config.iframeElementId] Optional ID for the iframe element
   * @returns {Promise<void>} A promise that resolves when the export process is complete
   */
  public exportWallet = async ({
    iframeContainerId,
    iframeElementId = "turnkey-export-iframe",
  }: ExportWalletParams) => {
    const exportWalletIframeStamper = new IframeStamper({
      iframeContainer: document.getElementById(iframeContainerId),
      iframeElementId: iframeElementId,
      iframeUrl: "https://export.turnkey.com",
    });
    await exportWalletIframeStamper.init();

    if (this.turnkeyClient.stamper === this.iframeStamper) {
      return this.exportWalletInner({
        exportStamper: exportWalletIframeStamper,
        exportAs: "SEED_PHRASE",
      });
    }

    return this.exportWalletInner({
      exportStamper: exportWalletIframeStamper,
      exportAs: "PRIVATE_KEY",
    });
  };

  /**
   * Asynchronous function that clears the user and resets the iframe stamper.
   *
   * @example
   * ```ts
   * import { AlchemySignerWebClient } from "@account-kit/signer";
   *
   * const client = new AlchemySignerWebClient({
   *  connection: {
   *    apiKey: "your-api-key",
   *  },
   *  iframeConfig: {
   *   iframeContainerId: "signer-iframe-container",
   *  },
   * });
   *
   * const account = await client.disconnect();
   * ```
   */
  public disconnect = async () => {
    this.user = undefined;
    this.iframeStamper.clear();
  };

  private initIframeStamper = async () => {
    if (!this.iframeStamper.publicKey()) {
      await this.iframeStamper.init();
    }

    this.setStamper(this.iframeStamper);

    return this.iframeStamper.publicKey()!;
  };

  private initWebauthnStamper = async (user: User | undefined = this.user) => {
    this.setStamper(this.webauthnStamper);
    if (user && user.credentialId) {
      // The goal here is to allow us to cache the allowed credential, but this doesn't work with hybrid transport :(
      this.webauthnStamper.allowCredentials = [
        {
          id: Buffer.from(user.credentialId, "base64"),
          type: "public-key",
          transports: ["internal", "hybrid"],
        },
      ];
    }
  };

  protected getWebAuthnAttestation = async (
    options?: CredentialCreationOptionOverrides,
    userDetails: { username: string } = {
      username: this.user?.email ?? "anonymous",
    }
  ) => {
    const challenge = generateRandomBuffer();
    const authenticatorUserId = generateRandomBuffer();

    const attestation = await getWebAuthnAttestation({
      publicKey: {
        ...options?.publicKey,
        authenticatorSelection: {
          residentKey: "preferred",
          requireResidentKey: false,
          userVerification: "preferred",
          ...options?.publicKey?.authenticatorSelection,
        },
        challenge,
        rp: {
          id: window.location.hostname,
          name: window.location.hostname,
          ...options?.publicKey?.rp,
        },
        pubKeyCredParams: [
          {
            type: "public-key",
            alg: -7,
          },
          {
            type: "public-key",
            alg: -257,
          },
        ],
        user: {
          id: authenticatorUserId,
          name: userDetails.username,
          displayName: userDetails.username,
          ...options?.publicKey?.user,
        },
      },
      signal: options?.signal,
    });

    // on iOS sometimes this is returned as empty or null, so handling that here
    if (attestation.transports == null || attestation.transports.length === 0) {
      attestation.transports = [
        "AUTHENTICATOR_TRANSPORT_INTERNAL",
        "AUTHENTICATOR_TRANSPORT_HYBRID",
      ];
    }

    return { challenge, authenticatorUserId, attestation };
  };
}
