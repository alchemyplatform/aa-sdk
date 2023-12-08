import { PKPEthersWallet } from "@lit-protocol/pkp-ethers";
import { LitAbility, LitActionResource } from "@lit-protocol/auth-helpers";
import { type AuthCallbackParams } from "@lit-protocol/types";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { generateSessionKeyPair } from "@lit-protocol/crypto";

import {
  type SignTypedDataParams,
  type SmartAccountAuthenticator,
} from "@alchemy/aa-core";
import type { TypedDataDomain } from "viem";

import {
  type LitAuthMethod,
  type LitSessionSigsMap,
  type LitAccountAuthenticatorParams,
  type LITAuthenticateProps,
} from "./types.js";

const SIGNER_TYPE: string = "lit";


/**
 * This class requies `@lit-protocol/lit-node-client`
 */
export class LitSigner<C extends LitAuthMethod | LitSessionSigsMap>
  implements
    SmartAccountAuthenticator<
      LITAuthenticateProps<C>,
      LitSessionSigsMap,
      PKPEthersWallet | undefined
    >
{
  inner: PKPEthersWallet | undefined;
  private _signer: PKPEthersWallet | undefined;
  private _client: LitNodeClient;
  private _pkpPublicKey: string;
  private _rpcUrl: string;
  private _authContext: C | undefined;

  constructor(params: LitAccountAuthenticatorParams) {
    this._pkpPublicKey = params.pkpPublicKey;
    this._client = new LitNodeClient({
      litNetwork: params.network ?? "cayenne",
      debug: params.debug ?? false,
    });
    this._rpcUrl = params.rpcUrl;
    this._client.connect().catch((err: any) => {
      throw new Error(`Error while connecting Lit Node Client: ${err}`);
    });
  }
  signerType: string = SIGNER_TYPE;

  authenticate = async (
    props: LITAuthenticateProps<C>
  ): Promise<LitSessionSigsMap> => {
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
      const authNeededCallback = async (params: AuthCallbackParams) => {
        const response = await this._client.signSessionKey({
          sessionKey: sessionKeypair,
          statement: params.statement,
          authMethods: [props.context as LitAuthMethod],
          pkpPublicKey: this._pkpPublicKey,
          expiration: params.expiration,
          resources: params.resources,
          chainId: 1,
        });
        return response.authSig;
      };

      if (!this._client.ready) {
        await this._client.connect();
      }

      const sessionSigs = await this._client
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
      this._signer = new PKPEthersWallet({
        pkpPubKey: this._pkpPublicKey,
        rpc: this._rpcUrl,
        controllerSessionSigs: this._authContext as LitSessionSigsMap,
      });

      await this._signer.connect();

      this._authContext = sessionSigs as C;
      return sessionSigs;
    } else {
      this._signer = new PKPEthersWallet({
        pkpPubKey: this._pkpPublicKey,
        rpc: this._rpcUrl,
        controllerSessionSigs: props.context as LitSessionSigsMap,
      });

      await this._signer.connect();

      return props.context as LitSessionSigsMap;
    }
  };

  getAuthDetails = async (): Promise<LitSessionSigsMap> => {
    this._checkInternals();
    return this._authContext as LitSessionSigsMap;
  };

  getAddress = async () => {
    this._checkInternals();
    const address = await this.inner?.getAddress();

    return address as `0x${string}`;
  };

  signMessage = async (msg: Uint8Array | string) => {
    this._checkInternals();

    return this.inner?.signMessage(msg) as Promise<`0x${string}`>;
  };

  signTypedData = (params: SignTypedDataParams) => {
    this._checkInternals();

    return this.inner?._signTypedData(
      params.domain as TypedDataDomain,
      params.types as any,
      params.message
    ) as Promise<`0x${string}`>;
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
