import { createWalletClient, http } from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { WalletClientSigner } from "../wallet-client.js";

describe("Wallet Client Signer Tests", () => {
  it("should successfully sign", async () => {
    const dummyMnemonic =
      "test test test test test test test test test test test test";
    const wallet = mnemonicToAccount(dummyMnemonic);
    const walletClient = createWalletClient({
      account: wallet,
      // just a nonsense URL
      transport: http(`https://rpc.testnet.viem.io`),
    });

    const smartAccountSigner: WalletClientSigner = new WalletClientSigner(
      walletClient,
      "test"
    );

    const signature = await smartAccountSigner.signMessage("hello world");
    expect(signature).toMatchInlineSnapshot(
      '"0xcaf98cb42536352270a5a6e7d5aa2c186cd53701b9059d8596a1a13feb8d33d4194914598a6f60be302947b79d3c2635378adef4e72139e94030a3b8a7cd8d891c"'
    );
  });
});
