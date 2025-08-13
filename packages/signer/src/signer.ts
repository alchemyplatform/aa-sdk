import { type AlchemyTransport } from "@alchemy/common";
import { TurnkeyClient } from "@turnkey/http";
import { type Hex } from "viem";
import type {
  AddOauthProviderParams,
  AuthMethods,
  OauthProviderInfo,
  PasskeyInfo,
  TurnkeyStamper,
  User,
} from "./types";

export type CreateSignerParams = {
  transport: AlchemyTransport;
  stamper: TurnkeyStamper;
  orgId: string;
  idToken: string | undefined;
};

export class Signer {
  private isDisconnected = false;

  private constructor(
    private readonly transport: AlchemyTransport,
    private readonly turnkey: TurnkeyClient,
    private readonly user: User,
  ) {}

  public static async create({
    transport,
    stamper,
    orgId,
    idToken,
  }: CreateSignerParams): Promise<Signer> {
    const turnkey = new TurnkeyClient(
      { baseUrl: "https://api.turnkey.com" },
      stamper,
    );
    const stampedRequest = await turnkey.stampGetWhoami({
      organizationId: orgId,
    });
    // TODO: use the transport to make this call once it's finalized.
    const whoamiResponse = await notImplemented(transport, stampedRequest);
    // TODO: combine whoami response with idToken to get the full user object.
    const user = await notImplemented(whoamiResponse, idToken);
    return new Signer(transport, turnkey, user);
  }

  public signRawMessage = async (
    msg: Hex,
    mode: "SOLANA" | "ETHEREUM" = "ETHEREUM",
  ): Promise<Hex> => {
    this.throwIfDisconnected();
    // TODO: we need to add backwards compatibility for users who signed up before we added Solana support

    const stampedRequest = await this.turnkey.stampSignRawPayload({
      organizationId: this.user.orgId,
      type: "ACTIVITY_TYPE_SIGN_RAW_PAYLOAD_V2",
      timestampMs: Date.now().toString(),
      parameters: {
        encoding: "PAYLOAD_ENCODING_HEXADECIMAL",
        hashFunction:
          mode === "ETHEREUM"
            ? "HASH_FUNCTION_NO_OP"
            : "HASH_FUNCTION_NOT_APPLICABLE",
        payload: msg,
        signWith:
          mode === "ETHEREUM" ? this.user.address : this.user.solanaAddress!,
      },
    });

    // TODO: use transport once it's finalized.
    return notImplemented(this.transport, stampedRequest);
  };

  public async listAuthMethods(): Promise<AuthMethods> {
    this.throwIfDisconnected();
    return notImplemented();
  }

  public async setEmail(email: string): Promise<void> {
    this.throwIfDisconnected();
    return notImplemented(email);
  }

  public async addOauthProvider(
    params: AddOauthProviderParams,
  ): Promise<OauthProviderInfo> {
    this.throwIfDisconnected();
    return notImplemented(params);
  }

  public async removeOauthProvider(providerId: string): Promise<void> {
    this.throwIfDisconnected();
    return notImplemented(providerId);
  }

  public async addPasskey(
    params: CredentialCreationOptions,
  ): Promise<PasskeyInfo> {
    this.throwIfDisconnected();
    return notImplemented(params);
  }

  public async removePasskey(authenticatorId: string): Promise<void> {
    this.throwIfDisconnected();
    return notImplemented(authenticatorId);
  }

  public async disconnect(): Promise<void> {
    this.isDisconnected = true;
    (this.turnkey.stamper as TurnkeyStamper).clear?.();
  }

  private throwIfDisconnected(): void {
    if (this.isDisconnected) {
      throw new Error("Signer is disconnected");
    }
  }
}

function notImplemented(..._: unknown[]): Promise<never> {
  throw new Error("Not implemented");
}
