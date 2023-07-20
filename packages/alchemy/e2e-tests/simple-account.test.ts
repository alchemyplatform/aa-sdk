import {
  SimpleSmartContractAccount,
  type SimpleSmartAccountOwner,
} from "@alchemy/aa-core";
import { toHex } from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { polygonMumbai } from "viem/chains";
import { AlchemyProvider } from "../src/provider.js";
import { API_KEY, OWNER_MNEMONIC, PAYMASTER_POLICY_ID } from "./constants.js";

const ENTRYPOINT_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const SIMPLE_ACCOUNT_FACTORY_ADDRESS =
  "0x9406Cc6185a346906296840746125a0E44976454";

describe("Simple Account Tests", () => {
  const ownerAccount = mnemonicToAccount(OWNER_MNEMONIC);
  const owner: SimpleSmartAccountOwner = {
    signMessage: async (msg) =>
      ownerAccount.signMessage({
        message: { raw: toHex(msg) },
      }),
    getAddress: async () => ownerAccount.address,
  };
  const chain = polygonMumbai;
  const signer = new AlchemyProvider({
    apiKey: API_KEY,
    chain,
    entryPointAddress: ENTRYPOINT_ADDRESS,
  }).connect(
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

  it("should execute successfully", async () => {
    await new Promise((resolve) => setTimeout(resolve, 7500));
    const result = signer.sendUserOperation({
      target: await signer.getAddress(),
      data: "0x",
    });

    await expect(result).resolves.not.toThrowError();
  }, 10000);

  it("should fail to execute if account address is not deployed and not correct", async () => {
    const accountAddress = "0xc33AbD9621834CA7c6Fc9f9CC3c47b9c17B03f9F";
    const newSigner = new AlchemyProvider({
      apiKey: API_KEY,
      chain,
      entryPointAddress: ENTRYPOINT_ADDRESS,
    }).connect(
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

  it("should successfully execute with alchemy paymaster info", async () => {
    // TODO: this is super hacky right now
    // we have to wait for the test above to run and be confirmed so that this one submits successfully using the correct nonce
    // one way we could do this is by batching the two UOs together
    await new Promise((resolve) => setTimeout(resolve, 10000));
    const newSigner = signer.withAlchemyGasManager({
      provider: signer.rpcClient,
      policyId: PAYMASTER_POLICY_ID,
      entryPoint: ENTRYPOINT_ADDRESS,
    });

    const result = newSigner.sendUserOperation({
      target: await newSigner.getAddress(),
      data: "0x",
    });

    await expect(result).resolves.not.toThrowError();
  }, 20000);
});
