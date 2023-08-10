import {
  SimpleSmartContractAccount,
  type SimpleSmartAccountOwner,
} from "@alchemy/aa-core";
import { toHex, type Hash } from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { polygonMumbai } from "viem/chains";
import { AlchemyProvider } from "../src/provider.js";
import {
  RPC_URL,
  API_KEY,
  OWNER_MNEMONIC,
  PAYMASTER_POLICY_ID,
} from "./constants.js";

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
    rpcUrl: RPC_URL,
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
    const result = await signer.sendUserOperation({
      target: await signer.getAddress(),
      data: "0x",
    });
    const txnHash = signer.waitForUserOperationTransaction(result.hash as Hash);

    await expect(txnHash).resolves.not.toThrowError();
  }, 50000);

  it("should fail to execute if account address is not deployed and not correct", async () => {
    const accountAddress = "0xc33AbD9621834CA7c6Fc9f9CC3c47b9c17B03f9F";
    const newSigner = new AlchemyProvider({
      apiKey: API_KEY,
      rpcUrl: RPC_URL,
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
    const newSigner = signer.withAlchemyGasManager({
      policyId: PAYMASTER_POLICY_ID,
      entryPoint: ENTRYPOINT_ADDRESS,
    });

    const result = await newSigner.sendUserOperation({
      target: await newSigner.getAddress(),
      data: "0x",
    });
    const txnHash = signer.waitForUserOperationTransaction(result.hash as Hash);

    await expect(txnHash).resolves.not.toThrowError();
  }, 50000);

  it("should successfully override fees in alchemy paymaster", async () => {
    const newSigner = signer
      .withAlchemyGasManager({
        policyId: PAYMASTER_POLICY_ID,
        entryPoint: ENTRYPOINT_ADDRESS,
      })
      .withFeeDataGetter(async () => ({
        maxFeePerGas: 1n,
        maxPriorityFeePerGas: 1n,
      }));

    // this should fail since we set super low fees
    await expect(
      async () =>
        await newSigner.sendUserOperation({
          target: await newSigner.getAddress(),
          data: "0x",
        })
    ).rejects.toThrow();
  }, 50000);

  it("should successfully use paymaster with fee opts", async () => {
    const newSigner = new AlchemyProvider({
      apiKey: API_KEY,
      rpcUrl: RPC_URL,
      chain,
      entryPointAddress: ENTRYPOINT_ADDRESS,
      feeOpts: {
        baseFeeBufferPercent: 50n,
        maxPriorityFeeBufferPercent: 50n,
        preVerificationGasBufferPercent: 50n,
      },
    })
      .connect(
        (provider) =>
          new SimpleSmartContractAccount({
            entryPointAddress: ENTRYPOINT_ADDRESS,
            chain,
            owner,
            factoryAddress: SIMPLE_ACCOUNT_FACTORY_ADDRESS,
            rpcClient: provider,
          })
      )
      .withAlchemyGasManager({
        policyId: PAYMASTER_POLICY_ID,
        entryPoint: ENTRYPOINT_ADDRESS,
      });

    const result = await newSigner.sendUserOperation({
      target: await newSigner.getAddress(),
      data: "0x",
    });
    const txnHash = signer.waitForUserOperationTransaction(result.hash as Hash);

    await expect(txnHash).resolves.not.toThrowError();
  }, 50000);
});
