import {
  WalletClientSigner,
  type SmartAccountAuthenticator,
} from "@alchemy/aa-core";
import {
  type FordefiProviderConfig,
  type UserInfo,
  FordefiWeb3Provider,
} from "@fordefi/web3-provider";
import {
  createWalletClient,
  custom,
  type Hash,
  type SignableMessage,
  type TypedData,
  type TypedDataDefinition,
} from "viem";
import { signerTypePrefix } from "../constants.js";

/**
 * This class requires the `@fordefi/web3-provider` dependency.
 * `@alchemy/aa-signers` lists it as optional dependency.
 *
 * @see: https://github.com/FordefiHQ/web3-provider
 */
export class FordefiSigner
  implements SmartAccountAuthenticator<void, UserInfo, FordefiWeb3Provider>
{
  inner: FordefiWeb3Provider;
  private signer: WalletClientSigner | undefined;

  constructor(params: FordefiProviderConfig | { inner: FordefiWeb3Provider }) {
    if ("inner" in params) {
      this.inner = params.inner;
      return;
    }

    this.inner = new FordefiWeb3Provider(params);
  }

  readonly signerType = `${signerTypePrefix}fordefi`;

  getAddress = async () => {
    if (!this.signer) throw new Error("Not authenticated");

    const address = await this.signer.getAddress();
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

  authenticate = async (): Promise<UserInfo> => {
    if (this.inner == null) throw new Error("No provider found");

    await this.inner.connect();

    this.signer = new WalletClientSigner(
      createWalletClient({
        transport: custom(this.inner),
      }),
      this.signerType
    );

    return this.getAuthDetails();
  };

  getAuthDetails = async (): Promise<UserInfo> => {
    if (!this.signer) throw new Error("Not authenticated");

    return this.inner.getUserInfo();
  };
}
