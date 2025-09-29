import { createWalletClient, http } from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { WalletClientSigner } from "../wallet-client.js";

describe("Wallet Client Signer Tests", () => {
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
    "test",
  );

  it("should successfully sign a message", async () => {
    const signature = await smartAccountSigner.signMessage("hello world");
    expect(signature).toMatchInlineSnapshot(
      '"0xcaf98cb42536352270a5a6e7d5aa2c186cd53701b9059d8596a1a13feb8d33d4194914598a6f60be302947b79d3c2635378adef4e72139e94030a3b8a7cd8d891c"',
    );
  });

  it("should successfully sign a 7702 authorization", async () => {
    const signedAuthorization = await smartAccountSigner.signAuthorization({
      address: "0x69007702764179f14F51cdce752f4f775d74E139",
      chainId: 1,
      nonce: 1,
    });
    expect(signedAuthorization).toMatchInlineSnapshot(`
      {
        "address": "0x69007702764179f14F51cdce752f4f775d74E139",
        "chainId": 1,
        "nonce": 1,
        "r": "0xb5b39b3d7119d68c9936e476346f50061fed17c575ca395755ec0f41b45896bb",
        "s": "0x12e44057bd6c761da15b5ca5d860d11962ea34d1e1b9ce6eac7fbe2e8699469c",
        "v": 27n,
        "yParity": 0,
      }
    `);
  });
});
