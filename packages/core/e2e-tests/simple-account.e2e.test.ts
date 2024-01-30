import { polygonMumbai } from "@alchemy/aa-core";
import { fromHex, isAddress, type Address, type Chain, type Hex } from "viem";
import { generatePrivateKey } from "viem/accounts";
import {
  createPublicErc4337Client,
  createSimpleSmartAccount,
  createSmartAccountClientFromExisting,
  getDefaultEntryPointAddress,
  getDefaultSimpleAccountFactoryAddress,
  type SmartAccountSigner,
  type UserOperationFeeOptions,
  type UserOperationOverrides,
} from "../src/index.js";
import { LocalAccountSigner } from "../src/signer/local-account.js";
import { API_KEY, OWNER_MNEMONIC } from "./constants.js";

const chain = polygonMumbai;

describe("Simple Account Tests", () => {
  const owner: SmartAccountSigner =
    LocalAccountSigner.mnemonicToAccountSigner(OWNER_MNEMONIC);

  it("should successfully get counterfactual address", async () => {
    const provider = await givenConnectedProvider({ owner, chain });
    expect(provider.getAddress()).toMatchInlineSnapshot(
      `"0xb856DBD4fA1A79a46D426f537455e7d3E79ab7c4"`
    );
  });

  it("should execute successfully", async () => {
    const provider = await givenConnectedProvider({ owner, chain });
    const result = await provider.sendUserOperation({
      uo: {
        target: provider.getAddress(),
        data: "0x",
      },
    });

    const txnHash = provider.waitForUserOperationTransaction(result);

    await expect(txnHash).resolves.not.toThrowError();
  }, 60000);

  it("should fail to execute if account address is not deployed and not correct", async () => {
    const accountAddress = "0xc33AbD9621834CA7c6Fc9f9CC3c47b9c17B03f9F";
    const provider = await givenConnectedProvider({
      owner,
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

  it("should get counterfactual for undeployed account", async () => {
    const owner = LocalAccountSigner.privateKeyToAccountSigner(
      generatePrivateKey()
    );
    const provider = await givenConnectedProvider({ owner, chain });

    const address = provider.getAddress();
    expect(isAddress(address)).toBe(true);
  });

  it("should correctly fail to get address if rpc url is invalid", async () => {
    await expect(
      createSimpleSmartAccount({
        entryPointAddress: getDefaultEntryPointAddress(chain),
        chain,
        owner,
        factoryAddress: getDefaultSimpleAccountFactoryAddress(chain),
        rpcClient: createPublicErc4337Client({
          chain,
          rpcUrl: "ALCHEMY_RPC_URL",
        }),
      })
    ).rejects.toThrowErrorMatchingInlineSnapshot('"Invalid RPC URL."');
  });

  it("should correctly handle percentage overrides for buildUserOperation", async () => {
    const signer = await givenConnectedProvider({
      owner,
      chain,
    });

    const structPromise = signer.buildUserOperation({
      uo: {
        target: signer.getAddress(),
        data: "0x",
      },
    });

    await expect(structPromise).resolves.not.toThrowError();

    const signerWithFeeOptions = await givenConnectedProvider({
      owner,
      chain,
      feeOptions: {
        preVerificationGas: { percentage: 100 },
      },
    });

    const structWithFeeOptionsPromise = signerWithFeeOptions.buildUserOperation(
      {
        uo: {
          target: signer.getAddress(),
          data: "0x",
        },
      }
    );
    await expect(structWithFeeOptionsPromise).resolves.not.toThrowError();

    const [struct, structWithFeeOptions] = await Promise.all([
      structPromise,
      structWithFeeOptionsPromise,
    ]);

    const preVerificationGas =
      typeof struct.preVerificationGas === "string"
        ? fromHex(struct.preVerificationGas as Hex, "bigint")
        : struct.preVerificationGas;
    const preVerificationGasWithFeeOptions =
      typeof structWithFeeOptions.preVerificationGas === "string"
        ? fromHex(structWithFeeOptions.preVerificationGas as Hex, "bigint")
        : structWithFeeOptions.preVerificationGas;

    expect(preVerificationGasWithFeeOptions).toBeGreaterThan(
      preVerificationGas!
    );
  }, 60000);

  it("should correctly handle absolute overrides for sendUserOperation", async () => {
    const signer = await givenConnectedProvider({ owner, chain });

    const overrides: UserOperationOverrides = {
      preVerificationGas: 100_000_000n,
    };
    const promise = signer.buildUserOperation({
      uo: {
        target: signer.getAddress(),
        data: "0x",
      },
      overrides,
    });
    await expect(promise).resolves.not.toThrowError();

    const struct = await promise;
    expect(struct.preVerificationGas).toBe(100_000_000n);
  }, 60000);

  it("should correctly handle percentage overrides for sendUserOperation", async () => {
    const signer = await givenConnectedProvider({
      owner,
      chain,
      feeOptions: {
        preVerificationGas: { percentage: 100 },
      },
    });

    const struct = signer.sendUserOperation({
      uo: {
        target: signer.getAddress(),
        data: "0x",
      },
    });
    await expect(struct).resolves.not.toThrowError();
  }, 60000);
});

const givenConnectedProvider = async ({
  owner,
  chain,
  accountAddress,
  feeOptions,
}: {
  owner: SmartAccountSigner;
  chain: Chain;
  accountAddress?: Address;
  feeOptions?: UserOperationFeeOptions;
}) => {
  const client = createPublicErc4337Client({
    chain,
    rpcUrl: `${chain.rpcUrls.alchemy.http[0]}/${API_KEY}`,
  });
  return createSmartAccountClientFromExisting({
    client,
    account: await createSimpleSmartAccount({
      chain,
      owner,
      factoryAddress: getDefaultSimpleAccountFactoryAddress(chain),
      rpcClient: client,
      accountAddress,
    }),
    feeEstimator: async (struct) => ({
      ...struct,
      maxFeePerGas: 100_000_000_000n,
      maxPriorityFeePerGas: 100_000_000_000n,
    }),
    opts: { feeOptions },
  });
};
