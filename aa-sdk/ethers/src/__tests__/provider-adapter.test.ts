import { createLightAccount } from "@account-kit/smart-contracts";
import { Wallet } from "@ethersproject/wallet";
import { Alchemy, Network, type AlchemyProvider } from "alchemy-sdk";
import { http } from "viem";
import { polygonMumbai } from "viem/chains";
import { EthersProviderAdapter } from "../../src/provider-adapter.js";
import { convertWalletToAccountSigner } from "../utils.js";

describe("Simple Account Tests", async () => {
  const alchemy = new Alchemy({
    apiKey: "test",
    network: Network.MATIC_MUMBAI,
  });
  // demo mnemonic from viem docs
  const dummyMnemonic =
    "legal winner thank year wave sausage worth useful legal winner thank yellow";
  const signer = Wallet.fromMnemonic(dummyMnemonic);
  const alchemyProvider = await alchemy.config.getProvider();

  it("should correctly sign the message", async () => {
    const provider = await givenConnectedProvider({ alchemyProvider, signer });
    expect(
      await provider.signMessage(
        "0xa70d0af2ebb03a44dcd0714a8724f622e3ab876d0aa312f0ee04823285d6fb1b"
      )
    ).toBe(
      "0x007ecc361d63ab82d89faeecfb79d40127f376c1ef3d545aeec3578eadce9d0c405a4d1ae6177bdebdc8413065014f735ee98da9643cc0e25c07a7423b694f8ae71b"
    );
  });
});

const givenConnectedProvider = async ({
  alchemyProvider,
  signer,
}: {
  alchemyProvider: AlchemyProvider;
  signer: Wallet;
}) => {
  const chain = polygonMumbai;

  return EthersProviderAdapter.fromEthersProvider(
    alchemyProvider,
    chain
  ).connectToAccount(
    await createLightAccount({
      chain,
      accountAddress: "0x856185aedfab56809e6686d2d6d0c039d615bd9c",
      signer: convertWalletToAccountSigner(signer),
      transport: http(`${alchemyProvider.connection.url}`),
    })
  );
};
