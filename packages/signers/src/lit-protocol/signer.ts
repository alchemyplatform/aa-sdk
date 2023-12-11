import { PKPEthersWallet } from "@lit-protocol/pkp-ethers";
import { LitAbility, LitActionResource } from "@lit-protocol/auth-helpers";
import {
  type AuthCallbackParams,
  type AuthSig,
  type SessionSigsMap,
} from "@lit-protocol/types";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { generateSessionKeyPair } from "@lit-protocol/crypto";

import { type SignTypedDataParams } from "@alchemy/aa-core";
import type { Address, TypedDataDomain } from "viem";

import {
  type LitAuthMethod,
  type LitSessionSigsMap,
  type LitConfig,
  type LITAuthenticateProps,
  type LitSmartAccountAuthenticator,
} from "./types.js";

const SIGNER_TYPE: string = "lit";

/**
 * Implementation of `SmartAccountAuthenticator` for lit protocol
 * This class requies:
 * `@lit-protocol/lit-node-client`
 * `@lit-protocol/pkp-ethers`
 */
export class LitSigner<C extends LitAuthMethod | LitSessionSigsMap>
  implements LitSmartAccountAuthenticator<C>
{
  inner: LitNodeClient;
  private _signer: PKPEthersWallet | undefined;
  private _pkpPublicKey: string;
  private _rpcUrl: string;
  private _authContext: C | undefined;
  private _session: SessionSigsMap | undefined;

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
   * @param props {LITAuthenticateProps} Authentication params, only `context` is required
   * @returns {LitSessionSigsMap} Authenticated session material
   */
  authenticate = async (
    props: LITAuthenticateProps<C>
  ): Promise<LitSessionSigsMap> => {
    await this.inner?.connect().catch((err: any) => {
      throw new Error(`Error while connecting Lit Node Client: ${err}`);
    });

    // check if the object is structed as an auth method
    // if so we sign the session key with the auth method
    // as the auth material. If a session signature
    // is provided then we skip this step.
    if (Object.keys(props.context).indexOf("accessToken") > 0) {
      const resourceAbilities = [
        {
          resource: new LitActionResource("*"),
          ability: LitAbility.PKPSigning,
        },
      ];
      const sessionKeypair = props.sessionKeypair || generateSessionKeyPair();
      const chain = props.chain || "ethereum";
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
            chainId: 1,
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
            chainId: 1,
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
            new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
          resourceAbilityRequests: resourceAbilities,
          authNeededCallback,
        })
        .catch((err) => {
          console.log(
            "error while attempting to access session signatures: ",
            err
          );
          throw err;
        });

      this._authContext = props.context;
      this._session = sessionSigs;

      this._signer = new PKPEthersWallet({
        pkpPubKey: this._pkpPublicKey,
        rpc: this._rpcUrl,
        controllerSessionSigs: sessionSigs as LitSessionSigsMap,
      });

      await this._signer.init();

      this._authContext = sessionSigs as C;
    } else {
      this._authContext = props.context;
      this._session = props.context as SessionSigsMap;

      this._signer = new PKPEthersWallet({
        pkpPubKey: this._pkpPublicKey,
        rpc: this._rpcUrl,
        controllerSessionSigs: this._authContext as LitSessionSigsMap,
      });

      await this._signer.init();
    }

    return this._session;
  };

  getAuthDetails = async (): Promise<LitSessionSigsMap> => {
    this._checkInternals();
    return this._authContext as LitSessionSigsMap;
  };

  getAddress = async () => {
    this._checkInternals();
    const address = await this._signer?.getAddress();

    return address as `0x${string}`;
  };

  signMessage = async (msg: Uint8Array | string) => {
    this._checkInternals();

    return this._signer?.signMessage(msg) as Promise<Address>;
  };

  signTypedData = (params: SignTypedDataParams) => {
    this._checkInternals();

    return this._signer?._signTypedData(
      params.domain as TypedDataDomain,
      params.types as any,
      params.message
    ) as Promise<Address>;
  };

  private _checkInternals() {
    if (!this._authContext) {
      throw new Error("Session not created, did you call authenticate?");
    }

    if (!this._signer) {
      throw new Error("Signer is not initalized, did you call authenticate?");
    }
  }
}
