import {
  LocalAccountSigner,
  sepolia,
  type UserOperationStruct,
} from "@alchemy/aa-core";
import { Alchemy, Network } from "alchemy-sdk";
import * as simulateUoActions from "../src/actions/simulateUserOperationChanges.js";
import { alchemyEnhancedApiActions } from "../src/client/decorators/alchemyEnhancedApis.js";
import {
  createLightAccountAlchemyClient,
  type AlchemyLightAccountClientConfig,
} from "../src/index.js";
import {
  API_KEY,
  LIGHT_ACCOUNT_OWNER_MNEMONIC,
  PAYMASTER_POLICY_ID,
} from "./constants.js";

const simulateUoChangesSpy = vi.spyOn(
  simulateUoActions,
  "simulateUserOperationChanges"
);

const chain = sepolia;
const network = Network.ETH_SEPOLIA;

describe("Light Account Client Tests", () => {
  const signer = LocalAccountSigner.mnemonicToAccountSigner(
    LIGHT_ACCOUNT_OWNER_MNEMONIC
  );

  it("should successfully get counterfactual address", async () => {
    const provider = await givenConnectedProvider({ signer, chain });
    expect(provider.getAddress()).toMatchInlineSnapshot(
      '"0x86f3B0211764971Ad0Fc8C8898d31f5d792faD84"'
    );
  });

  it("should execute successfully", async () => {
    const provider = await givenConnectedProvider({ signer, chain });

    const result = await provider.sendUserOperation({
      uo: {
        target: provider.getAddress(),
        data: "0x",
      },
    });

    const txnHash = provider.waitForUserOperationTransaction(result);

    await expect(txnHash).resolves.not.toThrowError();
  }, 100000);

  it("should fail to execute if account address is not deployed and not correct", async () => {
    const accountAddress = "0xc33AbD9621834CA7c6Fc9f9CC3c47b9c17B03f9F";
    const provider = await givenConnectedProvider({
      signer,
      chain,
      accountAddress,
    });

    const result = provider.sendUserOperation({
      uo: {
        target: provider.getAddress(),
        data: "0x",
      },
    });

    await expect(result).rejects.toThrowError();
  });

  it("should successfully execute with alchemy paymaster info", async () => {
    const provider = await givenConnectedProvider({
      signer,
      chain,
      gasManagerConfig: {
        policyId: PAYMASTER_POLICY_ID,
      },
    });

    const result = await provider.sendUserOperation({
      uo: {
        target: provider.getAddress(),
        data: "0x",
      },
    });
    const txnHash = provider.waitForUserOperationTransaction(result);

    await expect(txnHash).resolves.not.toThrowError();
  }, 100000);

  it("should bypass paymaster when paymasterAndData of user operation overrides is set to 0x", async () => {
    const provider = await givenConnectedProvider({
      signer,
      chain,
      gasManagerConfig: {
        policyId: PAYMASTER_POLICY_ID,
      },
    });

    const uoStruct = (await provider.buildUserOperation({
      uo: {
        target: provider.getAddress(),
        data: "0x",
      },
      overrides: {
        paymasterAndData: "0x", // bypass paymaster
      },
    })) as UserOperationStruct<"0.6.0">;

    expect(uoStruct.paymasterAndData).toBe("0x");
  }, 100000);

  it("should successfully override fees and gas when using paymaster", async () => {
    const provider = await givenConnectedProvider({
      signer,
      chain,
      gasManagerConfig: {
        policyId: PAYMASTER_POLICY_ID,
      },
    });

    await expect(
      provider
        .buildUserOperation({
          uo: {
            target: provider.getAddress(),
            data: "0x",
          },
          overrides: {
            maxFeePerGas: 1n,
            maxPriorityFeePerGas: 1n,
            callGasLimit: 1n,
            verificationGasLimit: 1n,
            preVerificationGas: 1n,
          },
        })
        .then(
          ({
            maxFeePerGas,
            maxPriorityFeePerGas,
            callGasLimit,
            verificationGasLimit,
            preVerificationGas,
          }) => ({
            maxFeePerGas,
            maxPriorityFeePerGas,
            callGasLimit,
            verificationGasLimit,
            preVerificationGas,
          })
        )
    ).resolves.toMatchInlineSnapshot(`
      {
        "callGasLimit": "0x1",
        "maxFeePerGas": "0x1",
        "maxPriorityFeePerGas": "0x1",
        "preVerificationGas": "0x1",
        "verificationGasLimit": "0x1",
      }
    `);
  }, 100000);

  it("should successfully use paymaster with fee opts", async () => {
    const provider = await givenConnectedProvider({
      signer,
      chain,
      gasManagerConfig: {
        policyId: PAYMASTER_POLICY_ID,
      },
      opts: {
        feeOptions: {
          maxFeePerGas: { multiplier: 1.5 },
          maxPriorityFeePerGas: { multiplier: 1.5 },
          preVerificationGas: { multiplier: 1.5 },
        },
      },
    });

    const result = await provider.sendUserOperation({
      uo: {
        target: provider.getAddress(),
        data: "0x",
      },
    });
    const txnHash = provider.waitForUserOperationTransaction(result);

    await expect(txnHash).resolves.not.toThrowError();
  }, 100000);

  it("should execute successfully via drop and replace", async () => {
    const provider = await givenConnectedProvider({
      signer,
      chain,
    });

    const result = await provider.sendUserOperation({
      uo: {
        target: provider.getAddress(),
        data: "0x",
      },
    });
    const replacedResult = await provider.dropAndReplaceUserOperation({
      uoToDrop: result.request,
    });

    const txnHash = provider.waitForUserOperationTransaction(replacedResult);
    await expect(txnHash).resolves.not.toThrowError();
  }, 100000);

  it("should execute successfully via drop and replace when using paymaster", async () => {
    const provider = await givenConnectedProvider({
      signer,
      chain,
      gasManagerConfig: {
        policyId: PAYMASTER_POLICY_ID,
      },
    });

    const result = await provider.sendUserOperation({
      uo: {
        target: provider.getAddress(),
        data: "0x",
      },
    });

    const replacedResult = await provider.dropAndReplaceUserOperation({
      uoToDrop: result.request,
    });

    const txnHash = provider.waitForUserOperationTransaction(replacedResult);
    await expect(txnHash).resolves.not.toThrowError();
  }, 100000);

  it("should get token balances for the smart account", async () => {
    const alchemy = new Alchemy({
      apiKey: API_KEY!,
      network,
    });

    const provider = await givenConnectedProvider({
      signer,
      chain,
      gasManagerConfig: {
        policyId: PAYMASTER_POLICY_ID,
      },
    }).then((x) => x.extend(alchemyEnhancedApiActions(alchemy)));

    const address = provider.getAddress();
    const balances = await provider.core.getTokenBalances(address);
    expect(balances.tokenBalances.length).toMatchInlineSnapshot("1");
  }, 50000);

  it("should get owned nfts for the smart account", async () => {
    const alchemy = new Alchemy({
      apiKey: API_KEY!,
      network,
    });

    const provider = await givenConnectedProvider({
      signer,
      chain,
      gasManagerConfig: {
        policyId: PAYMASTER_POLICY_ID,
      },
    }).then((x) => x.extend(alchemyEnhancedApiActions(alchemy)));

    const address = provider.getAddress();
    const nfts = await provider.nft.getNftsForOwner(address);
    expect(nfts.ownedNfts).toMatchInlineSnapshot("[]");
  }, 100000);

  it("should correctly simulate asset changes for the user operation", async () => {
    const provider = await givenConnectedProvider({
      signer,
      chain,
    });

    const simulatedAssetChanges = await provider.simulateUserOperation({
      uo: {
        target: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
        data: "0x",
        value: 1n,
      },
    });

    expect(
      simulatedAssetChanges.changes.filter(
        (x) => x.to === "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef"
      )
    ).toMatchInlineSnapshot(`
      [
        {
          "amount": "0.000000000000000001",
          "assetType": "NATIVE",
          "changeType": "TRANSFER",
          "contractAddress": null,
          "decimals": 18,
          "from": "0x86f3b0211764971ad0fc8c8898d31f5d792fad84",
          "logo": "https://static.alchemyapi.io/images/network-assets/eth.png",
          "name": "Ethereum",
          "rawAmount": "1",
          "symbol": "ETH",
          "to": "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
          "tokenId": null,
        },
      ]
    `);
  }, 50000);

  it("should simulate as part of middleware stack when added to provider", async () => {
    const provider = await givenConnectedProvider({
      signer,
      chain,
      useSimulation: true,
    });

    await provider.buildUserOperation({
      uo: {
        target: provider.account.getEntryPoint().address,
        data: "0x",
        value: 1n,
      },
    });

    expect(simulateUoChangesSpy).toHaveBeenCalledOnce();
  }, 100000);
});

const givenConnectedProvider = async ({
  signer,
  chain,
  accountAddress,
  opts,
  gasManagerConfig,
  useSimulation = false,
}: AlchemyLightAccountClientConfig) =>
  createLightAccountAlchemyClient({
    chain,
    signer,
    accountAddress,
    apiKey: API_KEY!,
    gasManagerConfig,
    useSimulation,
    opts: {
      txMaxRetries: 10,
      ...opts,
      feeOptions: {
        maxFeePerGas: { multiplier: 1.5 },
        maxPriorityFeePerGas: { multiplier: 1.5 },
        ...opts?.feeOptions,
      },
    },
  });
