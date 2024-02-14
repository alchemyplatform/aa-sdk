import type { SmartAccountAuthenticator } from "@alchemy/aa-core";
import {
  hashMessage,
  hashTypedData,
  type Hex,
  type SignableMessage,
  type TypedData,
  type TypedDataDefinition,
} from "viem";
import { z } from "zod";
import {
  AlchemySignerClient,
  AlchemySignerClientParamsSchema,
} from "./client/index.js";
import type { CredentialCreationOptionOverrides, User } from "./client/types";
import {
  SessionManager,
  SessionManagerParamsSchema,
} from "./session/manager.js";

export type AuthParams =
  | { type: "email"; email: string; bundle: Promise<string> }
  | {
      type: "passkey";
      createNew: false;
    }
  | {
      type: "passkey";
      createNew: true;
      username: string;
      creationOpts?: CredentialCreationOptionOverrides;
    };

export const AlchemySignerParamsSchema = z
  .object({
    client: z.custom<AlchemySignerClient>().or(AlchemySignerClientParamsSchema),
  })
  .extend({ sessionConfig: SessionManagerParamsSchema.optional() });

export type AlchemySignerParams = z.input<typeof AlchemySignerParamsSchema>;

/**
 * A SmartAccountSigner that can be used with any SmartContractAccount
 *
 * This signer is not yet ready for production use. If you would like to use it
 * please reach out to the Alchemy team -- account-abstraction@alchemy.com
 */
export class AlchemySigner
  implements SmartAccountAuthenticator<AuthParams, User, AlchemySignerClient>
{
  signerType: string = "alchemy-signer";
  inner: AlchemySignerClient;
  private sessionManager: SessionManager;

  constructor(params_: AlchemySignerParams) {
    const { sessionConfig, ...params } =
      AlchemySignerParamsSchema.parse(params_);

    if ("connection" in params.client) {
      this.inner = new AlchemySignerClient(params.client);
    } else {
      this.inner = params.client;
    }

    this.sessionManager = new SessionManager(
      sessionConfig ?? { client: this.inner }
    );
  }

  /**
   * Authenticate a user with either an email or a passkey and create a session for that user
   *
   * @params params - undefined if passkey login, otherwise an object with email and bundle to resolve
   */
  authenticate: (params: AuthParams) => Promise<User> = async (params) => {
    if (params.type === "email") {
      return this.authenticateWithEmail(params);
    }

    return this.authenticateWithPasskey(params);
  };

  /**
   * NOTE: right now this only clears the session locally.
   */
  disconnect: () => Promise<void> = async () => {
    this.sessionManager.clearSession();
    await this.inner.disconnect();
  };

  /**
   * Gets the current logged in user
   * If a user has an ongoing session, it will use that session and
   * try to authenticate
   *
   * @throws if there is no user logged in
   * @returns the current user
   */
  getAuthDetails: () => Promise<User> = async () => {
    const sessionUser = await this.sessionManager.getSessionUser();
    if (sessionUser != null) {
      return sessionUser;
    }

    return this.inner.whoami();
  };

  getAddress: () => Promise<`0x${string}`> = async () => {
    const { address } = await this.inner.whoami();

    return address;
  };

  signMessage: (msg: SignableMessage) => Promise<`0x${string}`> = async (
    msg
  ) => {
    const messageHash = hashMessage(msg);

    return this.inner.signRawMessage(messageHash);
  };

  signTypedData: <
    const TTypedData extends TypedData | { [key: string]: unknown },
    TPrimaryType extends string = string
  >(
    params: TypedDataDefinition<TTypedData, TPrimaryType>
  ) => Promise<Hex> = async (params) => {
    const messageHash = hashTypedData(params);

    return this.inner.signRawMessage(messageHash);
  };

  /**
   * Unauthenticated call to look up a user's organizationId by email
   *
   * @param email
   * @returns the organization id for the user if they exist
   */
  getUser: (email: string) => Promise<{ orgId: string } | null> = async (
    email
  ) => {
    const result = await this.inner.lookupUserByEmail(email);

    if (result.orgId == null) {
      return null;
    }

    return {
      orgId: result.orgId,
    };
  };

  /**
   * Adds a passkey to the user's account
   */
  addPasskey: (params?: CredentialCreationOptions) => Promise<string[]> =
    async (params) => {
      return this.inner.addPasskey(params ?? {});
    };

  /**
   * Used to export the wallet for a given user
   * If the user is authenticated with an Email, this will return a seed phrase
   * If the user is authenticated with a Passkey, this will return a private key
   */
  exportWallet: (
    params: Parameters<(typeof this.inner)["exportWallet"]>[0]
  ) => Promise<boolean> = async (params) => {
    return this.inner.exportWallet(params);
  };

  private authenticateWithEmail = async (
    params: Extract<AuthParams, { email: string }>
  ) => {
    const existingUser = await this.getUser(params.email);
    const { orgId } = existingUser
      ? await this.inner.initEmailAuth({
          email: params.email,
          expirationSeconds: this.sessionManager.expirationTimeMs,
        })
      : await this.inner.createAccount({
          type: "email",
          email: params.email,
          expirationSeconds: this.sessionManager.expirationTimeMs,
        });

    // TODO: determine if this is the best way to do this.
    // We have examples of doing this, but should we do it with events instead?
    const bundle = await params.bundle;
    const user = await this.inner.completeEmailAuth({ bundle, orgId });

    this.sessionManager.setSession({
      type: "email",
      bundle,
      user,
    });

    return user;
  };

  private authenticateWithPasskey = async (
    args: Extract<AuthParams, { type: "passkey" }>
  ) => {
    let user: User;
    if (args.createNew) {
      const result = await this.inner.createAccount(args);
      // account creation for passkeys returns the whoami response so we don't have to
      // call it again after signup
      user = {
        address: result.address!,
        userId: result.userId!,
        orgId: result.orgId,
      };
    } else {
      user = await this.inner.lookupUserWithPasskey();
      if (!user) {
        throw new Error("No user found");
      }
    }

    this.sessionManager.setSession({
      type: "passkey",
      user,
    });

    return user;
  };
}
