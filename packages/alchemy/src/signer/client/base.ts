import {
  type ConnectionConfig,
  ConnectionConfigSchema,
} from "@alchemy/aa-core";
import { TurnkeyClient } from "@turnkey/http";
import EventEmitter from "eventemitter3";
import type { Hex } from "viem";
import { NotAuthenticatedError } from "../errors.js";
import { base64UrlEncode } from "../utils/base64UrlEncode.js";
import type {
  AlchemySignerClientEvent,
  AlchemySignerClientEvents,
  CreateAccountParams,
  EmailAuthParams,
  GetWebAuthnAttestationResult,
  SignerBody,
  SignerResponse,
  SignerRoutes,
  SignupResponse,
  User,
} from "./types";

export interface BaseSignerClientParams {
  stamper: TurnkeyClient["stamper"];
  connection: ConnectionConfig;
  rootOrgId?: string;
  rpId?: string;
}

export type ExportWalletStamper = TurnkeyClient["stamper"] & {
  injectWalletExportBundle(bundle: string): Promise<boolean>;
  injectKeyExportBundle(bundle: string): Promise<boolean>;
  publicKey(): string | null;
};

export abstract class BaseSignerClient<TExportWalletParams = unknown> {
  private _user: User | undefined;
  private connectionConfig: ConnectionConfig;
  protected turnkeyClient: TurnkeyClient;
  protected rootOrg: string;
  protected eventEmitter: EventEmitter<AlchemySignerClientEvents>;

  constructor(params: BaseSignerClientParams) {
    const { stamper, connection, rootOrgId } = params;

    this.rootOrg = rootOrgId ?? "24c1acf5-810f-41e0-a503-d5d13fa8e830";
    this.eventEmitter = new EventEmitter<AlchemySignerClientEvents>();
    this.connectionConfig = ConnectionConfigSchema.parse(connection);
    this.turnkeyClient = new TurnkeyClient(
      { baseUrl: "https://api.turnkey.com" },
      stamper
    );
  }

  protected get user() {
    return this._user;
  }

  protected set user(user: User | undefined) {
    if (user && !this._user) {
      this.eventEmitter.emit("connected", user);
    } else if (!user && this._user) {
      this.eventEmitter.emit("disconnected");
    }

    this._user = user;
  }

  protected setStamper(stamper: TurnkeyClient["stamper"]) {
    this.turnkeyClient.stamper = stamper;
  }

  protected exportWalletInner(params: {
    exportStamper: ExportWalletStamper;
    exportAs: "SEED_PHRASE" | "PRIVATE_KEY";
  }): Promise<boolean> {
    switch (params.exportAs) {
      case "PRIVATE_KEY":
        return this.exportAsPrivateKey(params.exportStamper);
      case "SEED_PHRASE":
        return this.exportAsSeedPhrase(params.exportStamper);
    }
  }

  // #region ABSTRACT METHODS

  public abstract createAccount(
    params: CreateAccountParams
  ): Promise<SignupResponse>;

  public abstract initEmailAuth(
    params: Omit<EmailAuthParams, "targetPublicKey">
  ): Promise<{ orgId: string }>;

  public abstract completeEmailAuth(params: {
    bundle: string;
    orgId: string;
  }): Promise<User>;

  public abstract disconnect(): Promise<void>;

  public abstract exportWallet(params: TExportWalletParams): Promise<boolean>;

  public abstract lookupUserWithPasskey(user?: User): Promise<User>;

  protected abstract getWebAuthnAttestation(
    options: CredentialCreationOptions,
    userDetails?: { username: string }
  ): Promise<GetWebAuthnAttestationResult>;

  // #endregion

  // #region PUBLIC METHODS

  /**
   * Listen to events emitted by the client
   *
   * @param event the event you want to listen to
   * @param listener the callback function to execute when an event is fired
   * @returns a function that will remove the listener when called
   */
  public on = <E extends AlchemySignerClientEvent>(
    event: E,
    listener: AlchemySignerClientEvents[E]
  ) => {
    this.eventEmitter.on(event, listener as any);

    return () => this.eventEmitter.removeListener(event, listener as any);
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

  public lookupUserByEmail = async (email: string) => {
    return this.request("/v1/lookup", { email });
  };

  /**
   * This will sign a message with the user's private key, without doing any transformations on the message.
   * For SignMessage or SignTypedData, the caller should hash the message before calling this method and pass
   * that result here.
   *
   * @param msg the hex representation of the bytes to sign
   * @returns the signature over the raw hex
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

  public getUser = (): User | null => {
    return this.user ?? null;
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

  // #endregion

  // #region PRIVATE METHODS
  private exportAsSeedPhrase = async (stamper: ExportWalletStamper) => {
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

  private exportAsPrivateKey = async (stamper: ExportWalletStamper) => {
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

  protected pollActivityCompletion = async <
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
  // #endregion
}
