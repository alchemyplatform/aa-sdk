import { z } from "zod";
import { BaseAlchemySigner } from "./base.js";
import { ConnectionConfigSchema, type ConnectionConfig } from "@aa-sdk/core";
import { BaseSignerClient } from "./client/base.js";
import { ApiKeyStamper } from "@turnkey/api-key-stamper";
import type {
  CreateAccountParams,
  EnableMfaParams,
  EnableMfaResult,
  OtpParams,
  SubmitOtpCodeResponse,
} from "./client/types.js";
import type {
  MfaFactor,
  VerifyMfaParams,
  RemoveMfaParams,
  AlchemySignerClientEvents,
  AuthenticatingEventMetadata,
  EmailAuthParams,
  GetWebAuthnAttestationResult,
  OauthConfig,
  OauthParams,
  User,
} from "./client/types.js";

// TODO(jh): add jsdoc comments if we end up keeping this.
export class AlchemyApiKeySignerClient extends BaseSignerClient<undefined> {
  constructor({
    connection,
    apiKey,
  }: {
    connection: ConnectionConfig;
    apiKey: {
      publicKey: string;
      privateKey: string;
    };
  }) {
    const stamper = new ApiKeyStamper({
      apiPrivateKey: apiKey.privateKey,
      apiPublicKey: apiKey.publicKey,
    });
    super({ connection, stamper });
  }

  public setUser = (user: User) => {
    this.user = user;
  };

  public override disconnect = async (): Promise<void> => {
    this.user = undefined;
  };

  // All of the other methods here are required to extend
  // the BaseSignerClient, but we do not need them...

  public override createAccount = async (_params: CreateAccountParams) => {
    // TODO(jh): it would be nice to support creating an account w/
    // an attached api key here once the signer service supports it.
    throw new Error(
      "Creating accounts is not supported by AlchemyApiKeySignerClient",
    );
  };

  override async initEmailAuth(
    _params: Omit<EmailAuthParams, "targetPublicKey">,
  ): Promise<{ orgId: string }> {
    throw new Error("Email auth is not supported by AlchemyApiKeySignerClient");
  }

  public override async submitOtpCode(
    _args: Omit<OtpParams, "targetPublicKey">,
  ): Promise<SubmitOtpCodeResponse> {
    throw new Error("OTP is not supported by AlchemyApiKeySignerClient");
  }

  override async completeAuthWithBundle(_params: {
    bundle: string;
    orgId: string;
    connectedEventName: keyof AlchemySignerClientEvents;
    authenticatingType: AuthenticatingEventMetadata["type"];
    idToken?: string;
  }): Promise<User> {
    throw new Error(
      "Auth with bundle is not supported by AlchemyApiKeySignerClient",
    );
  }

  override oauthWithRedirect = async (
    _args: Extract<OauthParams, { mode: "redirect" }>,
  ): Promise<User> => {
    throw new Error("OAuth is not supported by AlchemyApiKeySignerClient");
  };

  override oauthWithPopup(
    _args: Extract<OauthParams, { mode: "popup" }>,
  ): Promise<User> {
    throw new Error("OAuth is not supported by AlchemyApiKeySignerClient");
  }

  override exportWallet(_params: unknown): Promise<boolean> {
    throw new Error(
      "Exporting wallet is not supported by AlchemyApiKeySignerClient",
    );
  }

  override lookupUserWithPasskey(_user?: User): Promise<User> {
    throw new Error("Passkey is not supported by AlchemyApiKeySignerClient");
  }

  override targetPublicKey(): Promise<string> {
    throw new Error(
      "Target public key is not supported by AlchemyApiKeySignerClient",
    );
  }

  protected override getWebAuthnAttestation(
    _options: CredentialCreationOptions,
    _userDetails?: { username: string },
  ): Promise<GetWebAuthnAttestationResult> {
    throw new Error("WebAuthn is not supported by AlchemyApiKeySignerClient");
  }

  protected override getOauthConfig = async (): Promise<OauthConfig> => {
    throw new Error("Oauth is not supported by AlchemyApiKeySignerClient");
  };

  public override getMfaFactors = async () => {
    throw new Error("MFA is not supported by AlchemyApiKeySignerClient");
  };

  public override addMfa(_params: EnableMfaParams): Promise<EnableMfaResult> {
    throw new Error("MFA is not supported by AlchemyApiKeySignerClient");
  }

  public override verifyMfa(_params: VerifyMfaParams): Promise<{
    multiFactors: MfaFactor[];
  }> {
    throw new Error("MFA is not supported by AlchemyApiKeySignerClient");
  }

  public override removeMfa(_params: RemoveMfaParams): Promise<{
    multiFactors: MfaFactor[];
  }> {
    throw new Error("MFA is not supported by AlchemyApiKeySignerClient");
  }

  public override validateMultiFactors(_params: {
    encryptedPayload: string;
    multiFactors: { multiFactorId: string; multiFactorCode: string }[];
  }): Promise<{ bundle: string }> {
    throw new Error("MFA is not supported by AlchemyApiKeySignerClient");
  }
}

// TODO(jh): add jsdoc comments if we end up keeping this.
export const AlchemyApiKeySignerParamsSchema = z.object({
  connection: ConnectionConfigSchema,
  apiKey: z.object({
    publicKey: z.string(),
    privateKey: z.string(),
  }),
});

export type AlchemyApiKeySignerParams = z.input<
  typeof AlchemyApiKeySignerParamsSchema
>;

export class AlchemyApiKeySigner extends BaseAlchemySigner<AlchemyApiKeySignerClient> {
  constructor(params: AlchemyApiKeySignerParams) {
    const { apiKey, connection } =
      AlchemyApiKeySignerParamsSchema.parse(params);

    const client = new AlchemyApiKeySignerClient({ connection, apiKey });
    // TODO(jh): this constructor tries to init a SessionManager, which fails
    // if localstorage isn't available (i.e. in a non-browser environment).
    super({ client });

    this.signerType = "alchemy-api-key-signer";
  }

  public async setUserOrgId(orgId: string) {
    const user = await this.inner.whoami(orgId);
    this.inner.setUser(user);
  }
}

// TODO(jh): move this example to jsdoc comment.
// To use:
// const signer = new AlchemyApiKeySigner({
//   connection: {
//     apiKey: "todo",
//   },
//   apiKey: {
//     publicKey: "todo",
//     privateKey: "todo",
//   },
// });
// await signer.setUserOrgId("todo");
// signer.signMessage("todo");
