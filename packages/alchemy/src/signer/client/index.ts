import { ConnectionConfigSchema } from "@alchemy/aa-core";
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
} from "./types";

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

  public createAccount = async (params: CreateAccountParams) => {
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
