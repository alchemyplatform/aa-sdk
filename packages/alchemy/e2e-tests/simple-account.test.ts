import {
  SimpleSmartContractAccount,
  getDefaultSimpleAccountFactoryAddress,
  type SmartAccountSigner,
} from "@alchemy/aa-core";
import { Alchemy, Network } from "alchemy-sdk";
import { toHex, type Address, type Chain, type Hash } from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { AlchemyProvider } from "../src/provider.js";
import { API_KEY, OWNER_MNEMONIC, PAYMASTER_POLICY_ID } from "./constants.js";

const chain = sepolia;
const network = Network.ETH_SEPOLIA;

describe("Simple Account Tests", () => {
  const ownerAccount = mnemonicToAccount(OWNER_MNEMONIC);
  const owner: SmartAccountSigner = {
    signMessage: async (msg) =>
      ownerAccount.signMessage({
        message: { raw: toHex(msg) },
      }),
    signTypedData: async () => "0xHash",
    getAddress: async () => ownerAccount.address,
    signerType: "aa-sdk-tests",
  };

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

  it("should successfully execute with alchemy paymaster info", async () => {
    const signer = givenConnectedProvider({
      owner,
      chain,
    }).withAlchemyGasManager({
      policyId: PAYMASTER_POLICY_ID,
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

  it("should get token balances for the smart account", async () => {
    const alchemy = new Alchemy({
      apiKey: API_KEY!,
      network,
    });
    const provider = givenConnectedProvider({
      owner,
      chain,
    })
      .withAlchemyGasManager({
        policyId: PAYMASTER_POLICY_ID,
      })
      .withAlchemyEnhancedApis(alchemy);

    const address = await provider.getAddress();
    const balances = await provider.core.getTokenBalances(address);
    expect(balances.tokenBalances).toMatchInlineSnapshot(`
      [
        {
          "contractAddress": "0x489c5cb7fd158b0a9e7975076d758268a756c025",
          "tokenBalance": "0x000000000000000000000000000000000000000000000000000000000065b9aa",
        },
        {
          "contractAddress": "0x54fa517f05e11ffa87f4b22ae87d91cec0c2d7e1",
          "tokenBalance": "0x000000000000000000000000000000000000000000000000000000000065b9aa",
        },
        {
          "contractAddress": "0xdcf5d3e08c5007dececdb34808c49331bd82a247",
          "tokenBalance": "0x00000000000000000000000000000000000000000000000000000000000f423f",
        },
      ]
    `);
  }, 50000);

  it("should get owned nfts for the smart account", async () => {
    const alchemy = new Alchemy({
      apiKey: API_KEY!,
      network,
    });
    const provider = givenConnectedProvider({
      owner,
      chain,
    })
      .withAlchemyGasManager({
        policyId: PAYMASTER_POLICY_ID,
      })
      .withAlchemyEnhancedApis(alchemy);

    const address = await provider.getAddress();
    const nfts = await provider.nft.getNftsForOwner(address);
    expect(nfts.ownedNfts).toMatchInlineSnapshot("[]");
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
    feeOpts,
  }).connect(
    (provider) =>
      new SimpleSmartContractAccount({
        chain,
        owner,
        factoryAddress: getDefaultSimpleAccountFactoryAddress(chain),
        rpcClient: provider,
        accountAddress,
      })
  );
