import { isAddress } from "viem";
import { generatePrivateKey } from "viem/accounts";
import { polygonMumbai } from "viem/chains";
import {
  SimpleSmartContractAccount,
  type SimpleSmartAccountOwner,
} from "../account/simple.js";
import { SmartAccountProvider } from "../provider/base.js";
import { LocalAccountSigner } from "../signer/local-account.js";
import type { BatchUserOperationCallData } from "../types.js";

const ENTRYPOINT_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const API_KEY = process.env.API_KEY!;
const OWNER_MNEMONIC = process.env.OWNER_MNEMONIC!;
const SIMPLE_ACCOUNT_FACTORY_ADDRESS =
  "0x9406Cc6185a346906296840746125a0E44976454";

describe("Simple Account Tests", () => {
  const owner: SimpleSmartAccountOwner =
    LocalAccountSigner.mnemonicToAccountSigner(OWNER_MNEMONIC);
  const chain = polygonMumbai;
  const signer = new SmartAccountProvider(
    `${chain.rpcUrls.alchemy.http[0]}/${API_KEY}`,
    ENTRYPOINT_ADDRESS,
    chain
  ).connect(
    (provider) =>
      new SimpleSmartContractAccount({
        entryPointAddress: ENTRYPOINT_ADDRESS,
        chain,
        owner,
        factoryAddress: SIMPLE_ACCOUNT_FACTORY_ADDRESS,
        rpcClient: provider,
      })
  );

  it("should succesfully get counterfactual address", async () => {
    expect(await signer.getAddress()).toMatchInlineSnapshot(
      `"0xb856DBD4fA1A79a46D426f537455e7d3E79ab7c4"`
    );
  });

  it("should correctly sign the message", async () => {
    expect(
      // TODO: expose sign message on the provider too
      await signer.account.signMessage(
        "0xa70d0af2ebb03a44dcd0714a8724f622e3ab876d0aa312f0ee04823285d6fb1b"
      )
    ).toBe(
      "0xd16f93b584fbfdc03a5ee85914a1f29aa35c44fea5144c387ee1040a3c1678252bf323b7e9c3e9b4dfd91cca841fc522f4d3160a1e803f2bf14eb5fa037aae4a1b"
    );
  });

  it("should execute successfully", async () => {
    const result = signer.sendUserOperation({
      target: await signer.getAddress(),
      data: "0x",
    });

    await expect(result).resolves.not.toThrowError();
  });

  it("should fail to execute if account address is not deployed and not correct", async () => {
    const accountAddress = "0xc33AbD9621834CA7c6Fc9f9CC3c47b9c17B03f9F";
    const newSigner = new SmartAccountProvider(
      `${chain.rpcUrls.alchemy.http[0]}/${API_KEY}`,
      ENTRYPOINT_ADDRESS,
      chain
    ).connect(
      (provider) =>
        new SimpleSmartContractAccount({
          entryPointAddress: ENTRYPOINT_ADDRESS,
          chain,
          owner,
          factoryAddress: SIMPLE_ACCOUNT_FACTORY_ADDRESS,
          rpcClient: provider,
          accountAddress,
        })
    );

    const result = newSigner.sendUserOperation({
      target: await newSigner.getAddress(),
      data: "0x",
    });

    await expect(result).rejects.toThrowError();
  });

  it("should correctly encode batch transaction data", async () => {
    const account = signer.account;
    const data = [
      {
        target: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
        data: "0xdeadbeef",
      },
      {
        target: "0x8ba1f109551bd432803012645ac136ddd64dba72",
        data: "0xcafebabe",
      },
    ] satisfies BatchUserOperationCallData;

    expect(await account.encodeBatchExecute(data)).toMatchInlineSnapshot(
      '"0x18dfb3c7000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000002000000000000000000000000deadbeefdeadbeefdeadbeefdeadbeefdeadbeef0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba720000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000004deadbeef000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004cafebabe00000000000000000000000000000000000000000000000000000000"'
    );
  });

  it("should get counterfactual for undeployed account", async () => {
    const owner = LocalAccountSigner.privateKeyToAccountSigner(
      generatePrivateKey()
    );
    const provider = new SmartAccountProvider(
      `${chain.rpcUrls.alchemy.http[0]}/${API_KEY}`,
      ENTRYPOINT_ADDRESS,
      chain
    ).connect(
      (rpcClient) =>
        new SimpleSmartContractAccount({
          entryPointAddress: ENTRYPOINT_ADDRESS,
          chain,
          owner,
          factoryAddress: SIMPLE_ACCOUNT_FACTORY_ADDRESS,
          rpcClient,
        })
    );

    const address = provider.getAddress();
    await expect(address).resolves.not.toThrowError();
    expect(isAddress(await address)).toBe(true);
  });
});
