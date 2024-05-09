import {
  WalletClientSigner,
  type SmartAccountAuthenticator,
  type SignTypedDataParams,
} from "@alchemy/aa-core";
import {
  type FordefiProviderConfig,
  FordefiWeb3Provider,
} from "@fordefi/web3-provider";
import {
  type ByteArray,
  createWalletClient,
  custom,
  type Hash,
  type Hex,
} from "viem";
import type { FordefiAuthDetails, FordefiAuthParams } from "./types";

/**
 * This class requires the `@fordefi/web3-provider` dependency.
 * `@alchemy/aa-signers` lists it as optional dependency.
 *
 * @see https://github.com/FordefiHQ/web3-provider
 */
export class FordefiSigner
  implements
    SmartAccountAuthenticator<
      FordefiAuthParams,
      FordefiAuthDetails,
      FordefiWeb3Provider
    >
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

  readonly signerType = "fordefi";

  getAddress = async () => {
    if (!this.signer) throw new Error("Not authenticated");

    const address = await this.signer.getAddress();
    if (address == null) throw new Error("No address found");

    return address as Hash;
  };

  signMessage = async (msg: string | Hex | ByteArray) => {
    if (!this.signer) throw new Error("Not authenticated");

    return this.signer.signMessage(msg);
  };

  signTypedData = (params: SignTypedDataParams) => {
    if (!this.signer) throw new Error("Not authenticated");

    return this.signer.signTypedData(params);
  };

  authenticate = async (): Promise<FordefiAuthDetails> => {
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

  getAuthDetails = async (): Promise<FordefiAuthDetails> => {
    if (!this.signer) throw new Error("Not authenticated");
  };
}
