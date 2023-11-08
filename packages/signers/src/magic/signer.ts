import {
  WalletClientSigner,
  type AuthSmartAccountSigner,
  type SignTypedDataParams,
} from "@alchemy/aa-core";
import { Magic, type MagicUserMetadata } from "magic-sdk";
import { createWalletClient, custom, type Hash } from "viem";
import { MagicUser } from "./user.js";

export class MagicSigner
  implements AuthSmartAccountSigner<Magic, {login: () => any}, MagicUserMetadata>
{
  inner: Magic;
  user: MagicUser | undefined;
  signer: WalletClientSigner | undefined;

  constructor({ inner }: { inner: Magic }) {
    this.inner = inner;
  }

  get signerType() {
    return "magic";
  }

  getAddress = async () => {
    if (!this.user) throw new Error("No User authenticated");

    const address = (await this.user.getDetails()).publicAddress;
    if (address == null) throw new Error("No address found");

    return address as Hash;
  };

  signMessage = async (msg: Uint8Array | string) => {
    if (!this.signer) throw new Error("No signer found");

    return this.signer.signMessage(msg);
  };

  signTypedData = (params: SignTypedDataParams) => {
    if (!this.signer) throw new Error("No signer found");

    return this.signer.signTypedData(params);
  };

  authenticateUser = async (params) => {
    // await this.inner.wallet.connectWithUI();
    await params.login()

    this.signer = new WalletClientSigner(
      createWalletClient({
        transport: custom(await this.inner.wallet.getProvider()),
      }),
      this.signerType
    );
    this.user = new MagicUser(this.inner);
    await this.user.initialize();

    return this.user.getDetails();
  };

  getUserDetails = async () => {
    if (!this.user) throw new Error("No User authenticated");

    return this.user.getDetails();
  };
}
