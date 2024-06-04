import { LitAbility, LitPKPResource } from "@lit-protocol/auth-helpers";
import { ALL_LIT_CHAINS } from "@lit-protocol/constants";
import { generateSessionKeyPair } from "@lit-protocol/crypto";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { PKPEthersWallet } from "@lit-protocol/pkp-ethers";
import {
  type AuthCallbackParams,
  type AuthSig,
  type LITEVMChain,
  type SessionSigsMap,
} from "@lit-protocol/types";
import {
  type Address,
  type Hex,
  type SignableMessage,
  type TypedData,
  type TypedDataDefinition,
  type TypedDataDomain,
} from "viem";
import { signerTypePrefix } from "../constants.js";
import {
  type LitAuthMethod,
  type LitAuthenticateProps,
  type LitConfig,
  type LitSessionSigsMap,
  type LitSmartAccountAuthenticator,
  type LitUserMetadata,
} from "./types.js";

const SIGNER_TYPE: string = `${signerTypePrefix}lit`;

/**
 * Implementation of `SmartAccountAuthenticator` for lit protocol
 * This class requies:
 * `@lit-protocol/lit-node-client@cayenne`
 * `@lit-protocol/pkp-ethers@cayenne`
 * `@lit-protocol/crypto@cayenne`
 * `@lit-protocol/auth-helpers@cayenne`
 * `@lit-protocol/types@cayenne`
 */
export class LitSigner<C extends LitAuthMethod | LitSessionSigsMap>
  implements LitSmartAccountAuthenticator<C>
{
  inner: LitNodeClient;
  public signer: PKPEthersWallet | undefined;
  private _pkpPublicKey: string;
  private _rpcUrl: string;
  private _authContext: C | undefined;
  public session: SessionSigsMap | undefined;

  constructor(params: LitConfig) {
    this._pkpPublicKey = params.pkpPublicKey;
    this.inner =
      params.inner ??
      new LitNodeClient({
        litNetwork: params.network ?? "cayenne",
        debug: params.debug ?? false,
      });
    this._rpcUrl = params.rpcUrl;
  }
  signerType: string = SIGNER_TYPE;

  /**
   * if generic type is `LitAuthMethod`, authenticates the supplied authentication material.
   * if type `SessionSigsMap`, this implementation will respect the existing auth and use the session material.
   *
   * @param props {LitAuthenticateProps} Authentication params, only `context` is required
   * @returns Authenticated session material
   * @throws if authentication operations fail this error is thrown
   */
  authenticate = async (
    props: LitAuthenticateProps<C>
  ): Promise<LitUserMetadata> => {
    if (!this.session) {
      // runs authentication logic
      await this._doAuthentication(props);
    }

    // check on internal state for authentication status
    if (!this.session) {
      throw new Error("Not Authenticated");
    }

    return this.session;
  };

  getAuthDetails = async (): Promise<LitUserMetadata> => {
    this._checkInternals();
    return this._authContext as LitSessionSigsMap;
  };

  getAddress = async () => {
    this._checkInternals();
    return this.signer?.getAddress() as Promise<Address>;
  };

  signMessage = async (msg: SignableMessage) => {
    this._checkInternals();

    return this.signer?.signMessage(
      typeof msg === "string" ? msg : msg.raw
    ) as Promise<Hex>;
  };

  signTypedData = async <
    const TTypedData extends TypedData | { [key: string]: unknown },
    TPrimaryType extends string = string
  >(
    params: TypedDataDefinition<TTypedData, TPrimaryType>
  ) => {
    this._checkInternals();

    return this.signer?._signTypedData(
      params.domain as TypedDataDomain,
      params.types as any,
      params.message as Record<string, any>
    ) as Promise<Hex>;
  };

  private _checkInternals() {
    if (!this._authContext) {
      throw new Error("Not Authenticated");
    }

    if (!this.signer) {
      throw new Error("Signer is not initialized, did you call authenticate?");
    }
  }

  /**
   * Runs the Lit Protocol authentication operations for a given piece of authentication material
   *
   * AuthMethod -> authenticates the auth material and signs a session.
   *
   * SessionSigsMap -> uses the session to create a signer instance.
   *
   * For more information on Lit Authentication see below:
   *
   * https://developer.litprotocol.com/v3/sdk/authentication/overview
   *
   * @param props {LitAuthenticationProps<C>} properties for configuring authentication operations
   */
  private async _doAuthentication(props: LitAuthenticateProps<C>) {
    /**
     * Check if the object is structured as an auth method
     * if so, we sign the session key with the auth method
     * as the auth material. Otherwise, if a session signature
     * is provided, then we skip this step.
     */
    if (Object.keys(props.context).indexOf("accessToken") > 0) {
      const resourceAbilities = [
        {
          resource: new LitPKPResource("*"),
          ability: LitAbility.PKPSigning,
        },
      ];
      const sessionKeypair = props.sessionKeypair || generateSessionKeyPair();
      const chain = props.chain || "ethereum";
      const chainInfo = ALL_LIT_CHAINS[chain];

      const chainId = (chainInfo as LITEVMChain).chainId ?? 1;
      let authNeededCallback: any;
      if (props.context?.authMethodType === 1) {
        authNeededCallback = async (params: AuthCallbackParams) => {
          const response = await this.inner.signSessionKey({
            statement: params.statement,
            authMethods: [props.context as LitAuthMethod],
            authSig: JSON.parse(props.context.accessToken as string) as AuthSig,
            pkpPublicKey: `0x${this._pkpPublicKey}`,
            expiration: params.expiration,
            resources: params.resources,
            chainId: chainId,
          });
          return response.authSig;
        };
      } else {
        authNeededCallback = async (params: AuthCallbackParams) => {
          const response = await this.inner.signSessionKey({
            statement: params.statement,
            sessionKey: sessionKeypair,
            authMethods: [props.context as LitAuthMethod],
            pkpPublicKey: `0x${this._pkpPublicKey}`,
            expiration: params.expiration,
            resources: params.resources,
            chainId: chainId,
          });
          return response.authSig;
        };
      }

      if (!this.inner.ready) {
        await this.inner.connect();
      }

      const sessionSigs = await this.inner
        .getSessionSigs({
          chain,
          expiration:
            props.expiration ??
            // set default exp to 1 week if not provided
            new Date(Date.now() + 60 * 60 * 24 * 7).toISOString(),
          resourceAbilityRequests: resourceAbilities,
          authNeededCallback,
        })
        .catch((err) => {
          throw err;
        });

      this._authContext = props.context;
      this.session = sessionSigs;

      this.signer = new PKPEthersWallet({
        pkpPubKey: this._pkpPublicKey,
        rpc: this._rpcUrl,
        controllerSessionSigs: sessionSigs as LitSessionSigsMap,
      });

      await this.signer.init();
    } else {
      this._authContext = props.context;
      this.session = props.context as SessionSigsMap;

      this.signer = new PKPEthersWallet({
        pkpPubKey: this._pkpPublicKey,
        rpc: this._rpcUrl,
        controllerSessionSigs: this._authContext as LitSessionSigsMap,
      });

      await this.signer.init();
    }
  }
}
