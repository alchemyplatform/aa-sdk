import dotenv from "dotenv";

import { createLightAccount } from "@account-kit/smart-contracts";
import { Wallet } from "@ethersproject/wallet";
import { Alchemy, Network, type AlchemyProvider } from "alchemy-sdk";
import { createPublicClient, http, type Hex } from "viem";
import { sepolia } from "viem/chains";
import { EthersProviderAdapter } from "../../src/provider-adapter.js";
import { convertWalletToAccountSigner } from "../utils.js";
dotenv.config();

const endpoint =
  process.env.VITEST_SEPOLIA_FORK_URL ??
  "https://ethereum-sepolia-rpc.publicnode.com";

describe("Simple Account Tests", async () => {
  const alchemy = new Alchemy({
    apiKey: "test",
    network: Network.ETH_SEPOLIA,
  });
  // demo mnemonic from viem docs
  const dummyMnemonic =
    "legal winner thank year wave sausage worth useful legal winner thank yellow";
  const signer = Wallet.fromMnemonic(dummyMnemonic);
  const alchemyProvider = await alchemy.config.getProvider();

  it("should correctly sign the message", async () => {
    const provider = await givenConnectedProvider({ alchemyProvider, signer });
    const message = "hello world";
    const signature = (await provider.signMessage(message)) as Hex;

    // We must use a public client, rather than an account client, to verify the message, because AA-SDK incorrectly attaches the account address as a "from" field to all actions taken by that client, including the `eth_call` used internally by viem's signature verifier logic. Per EIP-684, contract creation reverts on non-zero nonce, and the `eth_call`'s from field implicitly increases the nonce of the account contract, causing the contract creation to revert.
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http(`${endpoint}`),
    });

    expect(
      await publicClient.verifyMessage({
        address: provider.account.address,
        message,
        signature,
        // todo: This provider doesn't support signMessageWith6492, so we have to manually provider the factory data to the verifier. Add support here for 6492 signature generation.
        factory: await provider.account.getFactoryAddress(),
        factoryData: await provider.account.getFactoryData(),
      })
    ).toBe(true);
  });
});

const givenConnectedProvider = async ({
  alchemyProvider,
  signer,
}: {
  alchemyProvider: AlchemyProvider;
  signer: Wallet;
}) => {
  const chain = sepolia;

  return EthersProviderAdapter.fromEthersProvider(
    alchemyProvider,
    chain
  ).connectToAccount(
    await createLightAccount({
      chain,
      signer: convertWalletToAccountSigner(signer),
      transport: http(`${endpoint}`),
    })
  );
};
