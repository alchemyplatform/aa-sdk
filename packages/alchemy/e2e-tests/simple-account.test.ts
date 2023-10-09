import {
  SimpleSmartContractAccount,
  type SmartAccountSigner,
} from "@alchemy/aa-core";
import { toHex, type Address, type Chain, type Hash } from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { polygonMumbai } from "viem/chains";
import { AlchemyProvider } from "../src/provider.js";
import { API_KEY, OWNER_MNEMONIC, PAYMASTER_POLICY_ID } from "./constants.js";

const ENTRYPOINT_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const SIMPLE_ACCOUNT_FACTORY_ADDRESS =
  "0x9406Cc6185a346906296840746125a0E44976454";

describe("Simple Account Tests", () => {
  const ownerAccount = mnemonicToAccount(OWNER_MNEMONIC);
  const owner: SmartAccountSigner = {
    signMessage: async (msg) =>
      ownerAccount.signMessage({
        message: { raw: toHex(msg) },
      }),
    signTypedData: async () => "0xHash",
    getAddress: async () => ownerAccount.address,
  };
  const chain = polygonMumbai;

  it("should succesfully get counterfactual address", async () => {
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

  it("should successfully execute with alchemy paymaster info", async () => {
    const signer = givenConnectedProvider({
      owner,
      chain,
    }).withAlchemyGasManager({
      policyId: PAYMASTER_POLICY_ID,
      entryPoint: ENTRYPOINT_ADDRESS,
    });

    const result = await signer.sendUserOperation({
      target: await signer.getAddress(),
      data: "0x",
    });
    const txnHash = signer.waitForUserOperationTransaction(result.hash as Hash);

    await expect(txnHash).resolves.not.toThrowError();
  }, 50000);

  it("should successfully override fees in alchemy paymaster", async () => {
    const signer = givenConnectedProvider({ owner, chain })
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
        await signer.sendUserOperation({
          target: await signer.getAddress(),
          data: "0x",
        })
    ).rejects.toThrow();
  }, 50000);

  it("should successfully use paymaster with fee opts", async () => {
    const signer = givenConnectedProvider({
      owner,
      chain,
      feeOpts: {
        baseFeeBufferPercent: 50n,
        maxPriorityFeeBufferPercent: 50n,
        preVerificationGasBufferPercent: 50n,
      },
    });

    const result = await signer.sendUserOperation({
      target: await signer.getAddress(),
      data: "0x",
    });
    const txnHash = signer.waitForUserOperationTransaction(result.hash as Hash);

    await expect(txnHash).resolves.not.toThrowError();
  }, 50000);

  it("should execute successfully via drop and replace", async () => {
    const signer = givenConnectedProvider({
      owner,
      chain,
    });

    const result = await signer.sendUserOperation({
      target: await signer.getAddress(),
      data: "0x",
    });
    const replacedResult = await signer.dropAndReplaceUserOperation(
      result.request
    );

    const txnHash = signer.waitForUserOperationTransaction(replacedResult.hash);
    await expect(txnHash).resolves.not.toThrowError();
  }, 50000);

  it("should execute successfully via drop and replace when using paymaster", async () => {
    const signer = givenConnectedProvider({
      owner,
      chain,
    }).withAlchemyGasManager({
      policyId: PAYMASTER_POLICY_ID,
      entryPoint: ENTRYPOINT_ADDRESS,
    });

    const result = await signer.sendUserOperation({
      target: await signer.getAddress(),
      data: "0x",
    });
    const replacedResult = await signer.dropAndReplaceUserOperation(
      result.request
    );

    const txnHash = signer.waitForUserOperationTransaction(replacedResult.hash);
    await expect(txnHash).resolves.not.toThrowError();
  }, 50000);
});

const givenConnectedProvider = ({
  owner,
  chain,
  accountAddress,
  feeOpts,
}: {
  owner: SmartAccountSigner;
  chain: Chain;
  accountAddress?: Address;
  feeOpts?: {
    baseFeeBufferPercent?: bigint;
    maxPriorityFeeBufferPercent?: bigint;
    preVerificationGasBufferPercent?: bigint;
  };
}) =>
  new AlchemyProvider({
    apiKey: API_KEY!,
    chain,
    entryPointAddress: ENTRYPOINT_ADDRESS,
    feeOpts,
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
