import {
  ConnectionConfigSchema,
  type ConnectionConfig,
} from "@alchemy/aa-core";
import { TurnkeyClient, getWebAuthnAttestation } from "@turnkey/http";
import { IframeStamper } from "@turnkey/iframe-stamper";
import { WebauthnStamper } from "@turnkey/webauthn-stamper";
import { type Hex } from "viem";
import { z } from "zod";
import { NotAuthenticatedError } from "../errors.js";
import { base64UrlEncode } from "../utils/base64UrlEncode.js";
import { generateRandomBuffer } from "../utils/generateRandomBuffer.js";
import type {
  CreateAccountParams,
  CredentialCreationOptionOverrides,
  EmailAuthParams,
  SignerBody,
  SignerResponse,
  SignerRoutes,
  User,
} from "./types";

export const AlchemySignerClientParamsSchema = z.object({
  connection: ConnectionConfigSchema,
  iframeConfig: z.object({
    iframeElementId: z.string().default("turnkey-iframe"),
    iframeContainerId: z.string(),
  }),
  rpId: z.string().optional(),
});

export type AlchemySignerClientParams = z.input<
  typeof AlchemySignerClientParamsSchema
>;

// TODO: figure out a better way to do this
// use this to override the parent org id for suborgs
// used for whoami passkey requests to figure out the
// suborg for a user
const _ENV_ROOT_ORG_ID =
  typeof process !== "undefined"
    ? process.env.ROOT_ORG_ID ?? process.env.NEXT_PUBLIC_ROOT_ORG_ID
    : null;
const ROOT_ORG_ID = _ENV_ROOT_ORG_ID ?? "24c1acf5-810f-41e0-a503-d5d13fa8e830";

/**
 * A lower level client used by the AlchemySigner used to communicate with
 * Alchemy's signer service.
 *
 * This signer is not yet ready for production use. If you would like to use it
 * please reach out to the Alchemy team -- account-abstraction@alchemy.com
 */
export class AlchemySignerClient {
  private user: User | undefined;
  private connectionConfig: ConnectionConfig;
  private iframeStamper: IframeStamper;
  private webauthnStamper: WebauthnStamper;
  private turnkeyClient: TurnkeyClient;
  iframeContainerId: string;

  constructor(params: AlchemySignerClientParams) {
    const { connection, iframeConfig, rpId } =
      AlchemySignerClientParamsSchema.parse(params);
    this.connectionConfig = connection;

    this.iframeStamper = new IframeStamper({
      iframeElementId: iframeConfig.iframeElementId,
      iframeUrl: "https://auth.turnkey.com",
      iframeContainer: document.getElementById(iframeConfig.iframeContainerId),
    });

    this.iframeContainerId = iframeConfig.iframeContainerId;

    this.turnkeyClient = new TurnkeyClient(
      { baseUrl: "https://api.turnkey.com" },
      this.iframeStamper
    );

    this.webauthnStamper = new WebauthnStamper({
      rpId: rpId ?? window.location.hostname,
    });
  }

  public createAccount = async (params: CreateAccountParams) => {
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

    return result;
  };

  public initEmailAuth = async (
    params: Omit<EmailAuthParams, "targetPublicKey">
  ) => {
    const { email, expirationSeconds } = params;
    const publicKey = await this.initIframeStamper();

    return this.request("/v1/auth", {
      email,
      targetPublicKey: publicKey,
      expirationSeconds,
      redirectParams: params.redirectParams?.toString(),
    });
  };

  public completeEmailAuth = async ({
    bundle,
    orgId,
  }: {
    bundle: string;
    orgId: string;
  }) => {
    await this.initIframeStamper();

    const result = await this.iframeStamper.injectCredentialBundle(bundle);

    if (!result) {
      throw new Error("Failed to inject credential bundle");
    }

    const user = await this.whoami(orgId);

    return user;
  };

  public whoami = async (orgId = this.user?.orgId): Promise<User> => {
    if (this.user) {
      return this.user;
    }

    if (!orgId) {
      throw new Error("No orgId provided");
    }

    const stampedRequest = await this.turnkeyClient.stampGetWhoami({
      organizationId: orgId,
    });

    const user = await this.request("/v1/whoami", {
      stampedRequest,
    });

    const credentialId = (() => {
      try {
        return JSON.parse(stampedRequest?.stamp.stampHeaderValue)
          .credentialId as string;
      } catch (e) {
        return undefined;
      }
    })();

    this.user = {
      ...user,
      credentialId,
    };

    return this.user;
  };

  public lookupUserWithPasskey = async (user: User | undefined = undefined) => {
    await this.initWebauthnStamper(user);
    if (user) {
      this.user = user;
      return user;
    }

    const result = await this.whoami(ROOT_ORG_ID);
    await this.initWebauthnStamper(result);

    return result;
  };

  public lookupUserByEmail = async (email: string) => {
    return this.request("/v1/lookup", { email });
  };

  /**
   * This will sign a message with the user's private key, without doing any transformations on the message.
   * For SignMessage or SignTypedData, the caller should hash the message before calling this method and pass
   * that result here.
   *
   * @param msg the hex representation of the bytes to sign
   */
  public signRawMessage = async (msg: Hex) => {
    if (!this.user) {
      throw new NotAuthenticatedError();
    }

    const stampedRequest = await this.turnkeyClient.stampSignRawPayload({
      organizationId: this.user.orgId,
      type: "ACTIVITY_TYPE_SIGN_RAW_PAYLOAD_V2",
      timestampMs: Date.now().toString(),
      parameters: {
        encoding: "PAYLOAD_ENCODING_HEXADECIMAL",
        hashFunction: "HASH_FUNCTION_NO_OP",
        payload: msg,
        signWith: this.user.address,
      },
    });

    const { signature } = await this.request("/v1/sign-payload", {
      stampedRequest,
    });

    return signature;
  };

  public exportWallet = async ({
    iframeContainerId,
    iframeElementId = "turnkey-export-iframe",
  }: {
    iframeContainerId: string;
    iframeElementId?: string;
  }) => {
    const exportWalletIframeStamper = new IframeStamper({
      iframeContainer: document.getElementById(iframeContainerId),
      iframeElementId: iframeElementId,
      iframeUrl: "https://export.turnkey.com",
    });
    await exportWalletIframeStamper.init();

    if (this.turnkeyClient.stamper === this.iframeStamper) {
      return this.exportAsSeedPhrase(exportWalletIframeStamper);
    }

    return this.exportAsPrivateKey(exportWalletIframeStamper);
  };

  public getUser(): User | null {
    return this.user ?? null;
  }

  private exportAsSeedPhrase = async (stamper: IframeStamper) => {
    if (!this.user) {
      throw new NotAuthenticatedError();
    }

    const { wallets } = await this.turnkeyClient.getWallets({
      organizationId: this.user.orgId,
    });

    const walletAccounts = await Promise.all(
      wallets.map(({ walletId }) =>
        this.turnkeyClient.getWalletAccounts({
          organizationId: this.user!.orgId,
          walletId,
        })
      )
    ).then((x) => x.flatMap((x) => x.accounts));

    const walletAccount = walletAccounts.find(
      (x) => x.address === this.user!.address
    );

    if (!walletAccount) {
      throw new Error(
        `Could not find wallet associated with ${this.user.address}`
      );
    }

    const { activity } = await this.turnkeyClient.exportWallet({
      organizationId: this.user.orgId,
      type: "ACTIVITY_TYPE_EXPORT_WALLET",
      timestampMs: Date.now().toString(),
      parameters: {
        walletId: walletAccount!.walletId,
        targetPublicKey: stamper.publicKey()!,
      },
    });

    const { exportBundle } = await this.pollActivityCompletion(
      activity,
      this.user.orgId,
      "exportWalletResult"
    );

    const result = await stamper.injectWalletExportBundle(exportBundle);

    if (!result) {
      throw new Error("Failed to inject wallet export bundle");
    }

    return result;
  };

  private exportAsPrivateKey = async (stamper: IframeStamper) => {
    if (!this.user) {
      throw new NotAuthenticatedError();
    }

    const { activity } = await this.turnkeyClient.exportWalletAccount({
      organizationId: this.user.orgId,
      type: "ACTIVITY_TYPE_EXPORT_WALLET_ACCOUNT",
      timestampMs: Date.now().toString(),
      parameters: {
        address: this.user.address,
        targetPublicKey: stamper.publicKey()!,
      },
    });

    const { exportBundle } = await this.pollActivityCompletion(
      activity,
      this.user.orgId,
      "exportWalletAccountResult"
    );

    const result = await stamper.injectKeyExportBundle(exportBundle);

    if (!result) {
      throw new Error("Failed to inject wallet export bundle");
    }

    return result;
  };

  public addPasskey = async (options: CredentialCreationOptions) => {
    if (!this.user) {
      throw new NotAuthenticatedError();
    }
    const { attestation, challenge } = await this.getWebAuthnAttestation(
      options
    );

    const { activity } = await this.turnkeyClient.createAuthenticators({
      type: "ACTIVITY_TYPE_CREATE_AUTHENTICATORS_V2",
      timestampMs: Date.now().toString(),
      organizationId: this.user.orgId,
      parameters: {
        userId: this.user.userId,
        authenticators: [
          {
            attestation,
            authenticatorName: `passkey-${Date.now().toString()}`,
            challenge: base64UrlEncode(challenge),
          },
        ],
      },
    });

    const { authenticatorIds } = await this.pollActivityCompletion(
      activity,
      this.user.orgId,
      "createAuthenticatorsResult"
    );

    return authenticatorIds;
  };

  public request = async <R extends SignerRoutes>(
    route: R,
    body: SignerBody<R>
  ): Promise<SignerResponse<R>> => {
    const url = this.connectionConfig.rpcUrl ?? "https://api.g.alchemy.com";
    const basePath = "/signer";

    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    if (this.connectionConfig.apiKey) {
      headers.append("Authorization", `Bearer ${this.connectionConfig.apiKey}`);
    } else if (this.connectionConfig.jwt) {
      headers.append("Authorization", `Bearer ${this.connectionConfig.jwt}`);
    }

    const response = await fetch(`${url}${basePath}${route}`, {
      method: "POST",
      body: JSON.stringify(body),
      headers,
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const json = await response.json();

    return json as SignerResponse<R>;
  };

  public disconnect = async () => {
    this.user = undefined;
    this.iframeStamper.clear();
  };

  private pollActivityCompletion = async <
    T extends keyof Awaited<
      ReturnType<(typeof this.turnkeyClient)["getActivity"]>
    >["activity"]["result"]
  >(
    activity: Awaited<
      ReturnType<(typeof this.turnkeyClient)["getActivity"]>
    >["activity"],
    organizationId: string,
    resultKey: T
  ): Promise<
    NonNullable<
      Awaited<
        ReturnType<(typeof this.turnkeyClient)["getActivity"]>
      >["activity"]["result"][T]
    >
  > => {
    if (activity.status === "ACTIVITY_STATUS_COMPLETED") {
      return activity.result[resultKey]!;
    }

    const {
      activity: { status, id, result },
    } = await this.turnkeyClient.getActivity({
      activityId: activity.id,
      organizationId,
    });

    if (status === "ACTIVITY_STATUS_COMPLETED") {
      return result[resultKey]!;
    }

    if (
      status === "ACTIVITY_STATUS_FAILED" ||
      status === "ACTIVITY_STATUS_REJECTED" ||
      status === "ACTIVITY_STATUS_CONSENSUS_NEEDED"
    ) {
      throw new Error(
        `Failed to get activity with with id ${id} (status: ${status})`
      );
    }

    // TODO: add ability to configure this + add exponential backoff
    await new Promise((resolve) => setTimeout(resolve, 500));

    return this.pollActivityCompletion(activity, organizationId, resultKey);
  };

  private initIframeStamper = async () => {
    if (!this.iframeStamper.publicKey()) {
      await this.iframeStamper.init();
    }

    this.turnkeyClient.stamper = this.iframeStamper;

    return this.iframeStamper.publicKey()!;
  };

  private initWebauthnStamper = async (user: User | undefined = this.user) => {
    this.turnkeyClient.stamper = this.webauthnStamper;
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

  private getWebAuthnAttestation = async (
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
