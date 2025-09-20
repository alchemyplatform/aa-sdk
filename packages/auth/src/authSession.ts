import { TurnkeyClient } from "@turnkey/http";
import {
  hashMessage,
  hashTypedData,
  type Address,
  type Authorization,
  type HashTypedDataParameters,
  type Hex,
  type LocalAccount,
  type SignableMessage,
  parseSignature,
} from "viem";
import type {
  AddOauthProviderParams,
  AuthMethods,
  OauthProviderInfo,
  PasskeyInfo,
  TurnkeyStamper,
  User,
} from "./types";
import { dev_request } from "./devRequest.js";
import { toLocalAccount } from "./toLocalAccount.js";
import { hashAuthorization } from "viem/utils";
import {
  type AlchemyAuthEip1193Provider,
  create1193Provider,
} from "./provider.js";

export type CreateAuthSessionParams = {
  // TODO: replace apiKey with transport once it's ready.
  // transport: AlchemyTransport;
  apiKey: string;
  stamper: TurnkeyStamper;
  orgId: string;
  idToken: string | undefined;
};

export type SignRawPayloadParams = {
  payload: string;
  mode: "SOLANA" | "ETHEREUM";
};

export type SignMessageParams = {
  message: SignableMessage;
};

export class AuthSession {
  private isDisconnected = false;

  private constructor(
    // TODO: replace apiKey with transport once it's ready.
    private readonly apiKey: string,
    private readonly turnkey: TurnkeyClient,
    private readonly user: User,
  ) {}

  public static async create({
    apiKey,
    stamper,
    orgId,
    idToken: _,
  }: CreateAuthSessionParams): Promise<AuthSession> {
    const turnkey = new TurnkeyClient(
      { baseUrl: "https://api.turnkey.com" },
      stamper,
    );
    const stampedRequest = await turnkey.stampGetWhoami({
      organizationId: orgId,
    });
    // TODO: use the transport to make this call once it's finalized.
    const whoamiResponse = await dev_request(apiKey, "whoami", {
      stampedRequest,
    });
    // TODO: combine whoami response with idToken to get the full user object.
    // For now, just return the whoami response.
    const user = whoamiResponse;
    return new AuthSession(apiKey, turnkey, user);
  }

  public getAddress(): Address {
    return this.user.address;
  }

  public getUser(): User {
    return this.user;
  }

  public signRawPayload = async ({
    payload,
    mode,
  }: SignRawPayloadParams): Promise<Hex> => {
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
        payload,
        signWith:
          mode === "ETHEREUM" ? this.user.address : this.user.solanaAddress!,
      },
    });

    const { signature } = await this.dev_request("sign-payload", {
      stampedRequest,
    });
    return signature;
  };

  public signMessage({ message }: SignMessageParams): Promise<Hex> {
    return this.signRawPayload({
      payload: hashMessage(message),
      mode: "ETHEREUM",
    });
  }

  public signTypedData(typedData: HashTypedDataParameters): Promise<Hex> {
    return this.signRawPayload({
      payload: hashTypedData(typedData),
      mode: "ETHEREUM",
    });
  }

  public async signAuthorization(
    params: Authorization<number, false>,
  ): Promise<Authorization<number, true>> {
    const { chainId, nonce, address } = params;
    const hashedAuth = hashAuthorization({ address, chainId, nonce });
    const signatureHex = await this.signRawPayload({
      mode: "ETHEREUM",
      payload: hashedAuth,
    });
    const signature = parseSignature(signatureHex);
    return {
      address,
      chainId,
      nonce,
      ...signature,
    };
  }

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
      throw new Error("Auth session has been disconnected");
    }
  }

  public toLocalAccount(): LocalAccount {
    this.throwIfDisconnected();
    return toLocalAccount(this);
  }

  public getProvider(): AlchemyAuthEip1193Provider {
    this.throwIfDisconnected();
    return create1193Provider(this);
  }

  // TODO: remove this and use transport instead once it's ready.
  private dev_request(path: string, body: unknown): Promise<any> {
    return dev_request(this.apiKey, path, body);
  }
}

function notImplemented(..._: unknown[]): Promise<never> {
  throw new Error("Not implemented");
}
