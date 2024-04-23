import {
  WalletClientSigner,
  type SmartAccountAuthenticator,
} from "@alchemy/aa-core";
import { Magic, type MagicUserMetadata } from "magic-sdk";
import {
  createWalletClient,
  custom,
  type Hash,
  type SignableMessage,
  type TypedData,
  type TypedDataDefinition,
} from "viem";
import { signerTypePrefix } from "../constants.js";
import type { MagicAuthParams, MagicSDKParams } from "./types.js";

/**
 * This class requires the `magic-sdk` dependency.
 * `@alchemy/aa-signers` lists it as an optional dependency.
 *
 * @see https://github.com/magiclabs/magic-js)
 */
export class MagicSigner
  implements
    SmartAccountAuthenticator<MagicAuthParams, MagicUserMetadata, Magic>
{
  inner: Magic;
  private signer: WalletClientSigner | undefined;

  constructor(params: MagicSDKParams | { inner: Magic }) {
    if ("inner" in params) {
      this.inner = params.inner;
      return;
    }

    this.inner = new Magic(params.apiKey, params.options);
  }

  readonly signerType = `${signerTypePrefix}magic`;

  getAddress = async () => {
    if (!this.signer) throw new Error("Not authenticated");

    const address = (await this.inner.user.getInfo()).publicAddress;
    if (address == null) throw new Error("No address found");

    return address as Hash;
  };

  signMessage = async (msg: SignableMessage) => {
    if (!this.signer) throw new Error("Not authenticated");

    return this.signer.signMessage(msg);
  };

  signTypedData = async <
    const TTypedData extends TypedData | { [key: string]: unknown },
    TPrimaryType extends string = string
  >(
    params: TypedDataDefinition<TTypedData, TPrimaryType>
  ) => {
    if (!this.signer) throw new Error("Not authenticated");

    return this.signer.signTypedData(params);
  };

  authenticate = async (params: MagicAuthParams) => {
    await params.authenticate();

    this.signer = new WalletClientSigner(
      createWalletClient({
        transport: custom(await this.inner.wallet.getProvider()),
      }),
      this.signerType
    );

    return this.inner.user.getInfo();
  };

  getAuthDetails = async () => {
    if (!this.signer) throw new Error("Not authenticated");

    return this.inner.user.getInfo();
  };
}
