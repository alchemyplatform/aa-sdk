import { isAddress, type Address, type Chain, type Hash } from "viem";
import { generatePrivateKey } from "viem/accounts";
import { polygonMumbai } from "viem/chains";
import { SimpleSmartContractAccount } from "../src/account/simple.js";
import {
  getDefaultEntryPointAddress,
  getDefaultSimpleAccountFactoryAddressAddress,
  type SmartAccountSigner,
} from "../src/index.js";
import { SmartAccountProvider } from "../src/provider/base.js";
import { LocalAccountSigner } from "../src/signer/local-account.js";
import { API_KEY, OWNER_MNEMONIC, RPC_URL } from "./constants.js";

const chain = polygonMumbai;
const entryPointAddress = getDefaultEntryPointAddress(chain);
const factoryAddress = getDefaultSimpleAccountFactoryAddressAddress(chain);

describe("Simple Account Tests", () => {
  const owner: SmartAccountSigner =
    LocalAccountSigner.mnemonicToAccountSigner(OWNER_MNEMONIC);

  it("should successfully get counterfactual address", async () => {
    const signer = givenConnectedProvider({ owner, chain });
    expect(await signer.getAddress()).toMatchInlineSnapshot(
      `"0xb856DBD4fA1A79a46D426f537455e7d3E79ab7c4"`
    );
  });

  it("should execute successfully", async () => {
    const signer = givenConnectedProvider({ owner, chain });
    const result = await signer.sendUserOperation({
      target: await signer.getAddress(),
      data: "0x",
    });
    const txnHash = signer.waitForUserOperationTransaction(result.hash as Hash);

    await expect(txnHash).resolves.not.toThrowError();
  }, 50000);

  it("should fail to execute if account address is not deployed and not correct", async () => {
    const accountAddress = "0xc33AbD9621834CA7c6Fc9f9CC3c47b9c17B03f9F";
    const signer = givenConnectedProvider({ owner, chain, accountAddress });

    const result = signer.sendUserOperation({
      target: await signer.getAddress(),
      data: "0x",
    });

    await expect(result).rejects.toThrowError();
  });

  it("should get counterfactual for undeployed account", async () => {
    const owner = LocalAccountSigner.privateKeyToAccountSigner(
      generatePrivateKey()
    );
    const signer = givenConnectedProvider({ owner, chain });

    const address = signer.getAddress();
    await expect(address).resolves.not.toThrowError();
    expect(isAddress(await address)).toBe(true);
  });
});

const givenConnectedProvider = ({
  owner,
  chain,
  accountAddress,
}: {
  owner: SmartAccountSigner;
  chain: Chain;
  accountAddress?: Address;
}) => {
  return new SmartAccountProvider({
    rpcProvider:
      RPC_URL != null ? RPC_URL : `${chain.rpcUrls.alchemy.http[0]}/${API_KEY}`,
    chain,
  }).connect(
    (provider) =>
      new SimpleSmartContractAccount({
        entryPointAddress,
        chain,
        owner,
        factoryAddress,
        rpcClient: provider,
        accountAddress,
      })
  );
};
