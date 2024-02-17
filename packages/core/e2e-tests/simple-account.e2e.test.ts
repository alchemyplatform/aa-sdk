import { polygonMumbai } from "@alchemy/aa-core";
import {
  custom,
  fromHex,
  http,
  isAddress,
  type Address,
  type Chain,
  type Hex,
} from "viem";
import { generatePrivateKey } from "viem/accounts";
import {
  createBundlerClient,
  createSimpleSmartAccount,
  createSmartAccountClientFromExisting,
  getDefaultSimpleAccountFactoryAddress,
  type SmartAccountSigner,
  type UserOperationFeeOptions,
  type UserOperationOverrides,
} from "../src/index.js";
import { LocalAccountSigner } from "../src/signer/local-account.js";
import { API_KEY, OWNER_MNEMONIC } from "./constants.js";

const chain = polygonMumbai;

describe("Simple Account Tests", () => {
  const signer: SmartAccountSigner =
    LocalAccountSigner.mnemonicToAccountSigner(OWNER_MNEMONIC);

  it("should successfully get counterfactual address", async () => {
    const provider = await givenConnectedProvider({ signer, chain });
    expect(provider.getAddress()).toMatchInlineSnapshot(
      `"0xb856DBD4fA1A79a46D426f537455e7d3E79ab7c4"`
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
  }, 60000);

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

  it("should get counterfactual for undeployed account", async () => {
    const signer = LocalAccountSigner.privateKeyToAccountSigner(
      generatePrivateKey()
    );
    const provider = await givenConnectedProvider({ signer, chain });

    const address = provider.getAddress();
    expect(isAddress(address)).toBe(true);
  });

  it("should correctly handle multiplier overrides for buildUserOperation", async () => {
    const provider = await givenConnectedProvider({
      signer,
      chain,
    });

    const structPromise = provider.buildUserOperation({
      uo: {
        target: provider.getAddress(),
        data: "0x",
      },
    });

    await expect(structPromise).resolves.not.toThrowError();

    const providerWithFeeOptions = await givenConnectedProvider({
      signer,
      chain,
      feeOptions: {
        preVerificationGas: { multiplier: 2 },
      },
    });

    const structWithFeeOptionsPromise =
      await providerWithFeeOptions.buildUserOperation({
        uo: {
          target: provider.getAddress(),
          data: "0x",
        },
      });
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
    const provider = await givenConnectedProvider({ signer, chain });

    const overrides: UserOperationOverrides = {
      preVerificationGas: 100_000_000n,
    };
    const promise = provider.buildUserOperation({
      uo: {
        target: provider.getAddress(),
        data: "0x",
      },
      overrides,
    });
    await expect(promise).resolves.not.toThrowError();

    const struct = await promise;
    expect(struct.preVerificationGas).toBe(100_000_000n);
  }, 60000);

  it("should correctly handle multiplier overrides for sendUserOperation", async () => {
    const provider = await givenConnectedProvider({
      signer,
      chain,
      feeOptions: {
        preVerificationGas: { multiplier: 2 },
      },
    });

    const struct = await provider.sendUserOperation({
      uo: {
        target: provider.getAddress(),
        data: "0x",
      },
    });
    await expect(struct).resolves.not.toThrowError();
  }, 60000);
});

const givenConnectedProvider = async ({
  signer,
  chain,
  accountAddress,
  feeOptions,
}: {
  signer: SmartAccountSigner;
  chain: Chain;
  accountAddress?: Address;
  feeOptions?: UserOperationFeeOptions;
}) => {
  const client = createBundlerClient({
    chain,
    transport: http(`${chain.rpcUrls.alchemy.http[0]}/${API_KEY}`),
  });
  return createSmartAccountClientFromExisting({
    client,
    account: await createSimpleSmartAccount({
      chain,
      signer,
      factoryAddress: getDefaultSimpleAccountFactoryAddress(chain),
      transport: custom(client),
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
