import {
  fromHex,
  isAddress,
  type Address,
  type Chain,
  type Hash,
  type Hex,
} from "viem";
import { generatePrivateKey } from "viem/accounts";
import { polygonMumbai } from "viem/chains";
import { SimpleSmartContractAccount } from "../src/account/simple.js";
import {
  getDefaultSimpleAccountFactoryAddress,
  type SmartAccountSigner,
  type UserOperationFeeOptions,
  type UserOperationOverrides,
} from "../src/index.js";
import { SmartAccountProvider } from "../src/provider/base.js";
import { LocalAccountSigner } from "../src/signer/local-account.js";
import { API_KEY, OWNER_MNEMONIC } from "./constants.js";

const chain = polygonMumbai;

describe("Simple Account Tests", () => {
  const owner: SmartAccountSigner =
    LocalAccountSigner.mnemonicToAccountSigner(OWNER_MNEMONIC);

  it("should successfully get counterfactual address", async () => {
    const provider = givenConnectedProvider({ owner, chain });
    expect(await provider.getAddress()).toMatchInlineSnapshot(
      `"0xb856DBD4fA1A79a46D426f537455e7d3E79ab7c4"`
    );
  });

  it("should execute successfully", async () => {
    const provider = givenConnectedProvider({ owner, chain });
    const result = await provider.sendUserOperation({
      target: await provider.getAddress(),
      data: "0x",
    });
    const txnHash = provider.waitForUserOperationTransaction(
      result.hash as Hash
    );

    await expect(txnHash).resolves.not.toThrowError();
  }, 60000);

  it("should fail to execute if account address is not deployed and not correct", async () => {
    const accountAddress = "0xc33AbD9621834CA7c6Fc9f9CC3c47b9c17B03f9F";
    const provider = givenConnectedProvider({ owner, chain, accountAddress });

    const result = provider.sendUserOperation({
      target: await provider.getAddress(),
      data: "0x",
    });

    await expect(result).rejects.toThrowError();
  });

  it("should get counterfactual for undeployed account", async () => {
    const owner = LocalAccountSigner.privateKeyToAccountSigner(
      generatePrivateKey()
    );
    const provider = givenConnectedProvider({ owner, chain });

    const address = provider.getAddress();
    await expect(address).resolves.not.toThrowError();
    expect(isAddress(await address)).toBe(true);
  });

  it("should correctly handle percentage overrides for buildUserOperation", async () => {
    const signer = givenConnectedProvider({
      owner,
      chain,
    });

    const structPromise = signer.buildUserOperation({
      target: await signer.getAddress(),
      data: "0x",
    });
    await expect(structPromise).resolves.not.toThrowError();

    const signerWithFeeOptions = givenConnectedProvider({
      owner,
      chain,
      feeOptions: {
        preVerificationGas: { percentage: 100 },
      },
    });

    const structWithFeeOptionsPromise = signerWithFeeOptions.buildUserOperation(
      {
        target: await signer.getAddress(),
        data: "0x",
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
    const signer = givenConnectedProvider({ owner, chain });

    const overrides: UserOperationOverrides = {
      preVerificationGas: 100_000_000n,
    };
    const promise = signer.buildUserOperation(
      {
        target: await signer.getAddress(),
        data: "0x",
      },
      overrides
    );
    await expect(promise).resolves.not.toThrowError();

    const struct = await promise;
    expect(struct.preVerificationGas).toBe(100_000_000n);
  }, 60000);

  it("should correctly handle percentage overrides for sendUserOperation", async () => {
    const signer = givenConnectedProvider({
      owner,
      chain,
      feeOptions: {
        preVerificationGas: { percentage: 100 },
      },
    });

    const struct = signer.sendUserOperation({
      target: await signer.getAddress(),
      data: "0x",
    });
    await expect(struct).resolves.not.toThrowError();
  }, 60000);
});

const givenConnectedProvider = ({
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
  const provider = new SmartAccountProvider({
    rpcProvider: `${chain.rpcUrls.alchemy.http[0]}/${API_KEY}`,
    chain,
    opts: { feeOptions },
  });
  const feeDataGetter = async () => ({
    maxFeePerGas: 100_000_000_000n,
    maxPriorityFeePerGas: 100_000_000_000n,
  });
  provider.withFeeDataGetter(feeDataGetter);
  return provider.connect(
    (provider) =>
      new SimpleSmartContractAccount({
        chain,
        owner,
        factoryAddress: getDefaultSimpleAccountFactoryAddress(chain),
        rpcClient: provider,
        accountAddress,
      })
  );
};
