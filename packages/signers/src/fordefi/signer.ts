import {
  WalletClientSigner,
  type SmartAccountAuthenticator,
} from "@alchemy/aa-core";
import {
  type FordefiProviderConfig,
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
 * @see https://github.com/FordefiHQ/web3-provider
 */
export class FordefiSigner
  implements SmartAccountAuthenticator<void, void, FordefiWeb3Provider>
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

  /**
   * Returns the address managed by this signer.
   *
   * @returns the address managed by this signer
   * @throws if the provider is not authenticated, or if the address was not found
   */
  getAddress = async () => {
    if (!this.signer) throw new Error("Not authenticated");

    const address = await this.signer.getAddress();
    if (address == null) throw new Error("No address found");

    return address satisfies Hash;
  };

  /**
   * Signs a message with the authenticated account.
   *
   * @param msg the message to sign
   * @returns the address of the authenticated account
   * @throws if the provider is not authenticated
   */
  signMessage = async (msg: SignableMessage) => {
    if (!this.signer) throw new Error("Not authenticated");

    return this.signer.signMessage(msg);
  };

  /**
   * Signs a typed data object with the authenticated account.
   *
   * @param params the data object to sign
   * @returns the signed data as a hex string
   * @throws if the provider is not authenticated
   */
  signTypedData = async <
    const TTypedData extends TypedData | { [key: string]: unknown },
    TPrimaryType extends string = string
  >(
    params: TypedDataDefinition<TTypedData, TPrimaryType>
  ) => {
    if (!this.signer) throw new Error("Not authenticated");

    return this.signer.signTypedData(params);
  };

  /**
   * Authenticates with the Fordefi platform and verifies that this client
   * is authorized to manage the account.
   * This step is required before any signing operations can be performed.
   *
   * @returns void
   * @throws if no provider was found, or if authentication failed
   */
  authenticate = async (): Promise<void> => {
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

  /**
   * Verifies that this signer is authenticated, and throws an error otherwise.
   * Authentication details are not available.
   *
   * @returns void
   * @throws Error if this signer is not authenticated
   */
  getAuthDetails = async (): Promise<void> => {
    if (!this.signer) throw new Error("Not authenticated");
  };
}
