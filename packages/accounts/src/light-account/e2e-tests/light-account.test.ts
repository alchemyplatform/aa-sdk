import {
  LocalAccountSigner,
  Logger,
  LogLevel,
  type SmartAccountSigner,
  type UserOperationFeeOptions,
} from "@alchemy/aa-core";
import {
  isAddress,
  toHex,
  type Address,
  type Chain,
  type Hash,
  type HDAccount,
} from "viem";
import { generatePrivateKey } from "viem/accounts";
import { sepolia } from "viem/chains";
import {
  createLightAccountProvider,
  LightSmartContractAccount,
} from "../../index.js";
import {
  API_KEY,
  LIGHT_ACCOUNT_OWNER_MNEMONIC,
  UNDEPLOYED_OWNER_MNEMONIC,
} from "./constants.js";

const chain = sepolia;

Logger.setLogLevel(LogLevel.DEBUG);

describe("Light Account Tests", () => {
  const owner: SmartAccountSigner<HDAccount> =
    LocalAccountSigner.mnemonicToAccountSigner(LIGHT_ACCOUNT_OWNER_MNEMONIC);
  const undeployedOwner = LocalAccountSigner.mnemonicToAccountSigner(
    UNDEPLOYED_OWNER_MNEMONIC
  );

  it("should successfully get counterfactual address", async () => {
    const provider = givenConnectedProvider({ owner, chain });
    expect(await provider.getAddress()).toMatchInlineSnapshot(
      '"0x1a3a89cd46f124EF40848966c2D7074a575dbC27"'
    );
  });

  it("should sign typed data successfully", async () => {
    const provider = givenConnectedProvider({ owner, chain });
    const typedData = {
      types: {
        Request: [{ name: "hello", type: "string" }],
      },
      primaryType: "Request",
      message: {
        hello: "world",
      },
    };
    expect(await provider.signTypedData(typedData)).toBe(
      await owner.signTypedData(typedData)
    );
  });

  it("should sign message successfully", async () => {
    const provider = givenConnectedProvider({ owner, chain });
    expect(await provider.signMessage("test")).toBe(
      await owner.signMessage("test")
    );
  });

  it("should sign typed data with 6492 successfully for undeployed account", async () => {
    const undeployedProvider = givenConnectedProvider({
      owner: undeployedOwner,
      chain,
    });
    const typedData = {
      types: {
        Request: [{ name: "hello", type: "string" }],
      },
      primaryType: "Request",
      message: {
        hello: "world",
      },
    };
    expect(
      await undeployedProvider.signTypedDataWith6492(typedData)
    ).toMatchInlineSnapshot(
      '"0x00000000000000000000000000000055c0b4fa41dde26a74435ff03692292fbd000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000000445fbfb9cf000000000000000000000000ef9d7530d16df66481adf291dc9a12b44c7f7df00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000041591a9422219a5f2bc87ee24a82a6d5ef9674bf7408a2a289984de258466d148e75efb65b487ffbfcb061b268b1b667d8d7d4eac2c3d9d2d0a52d49c891be567c1c000000000000000000000000000000000000000000000000000000000000006492649264926492649264926492649264926492649264926492649264926492"'
    );
  });

  it("should sign message with 6492 successfully for undeployed account", async () => {
    const undeployedProvider = givenConnectedProvider({
      owner: undeployedOwner,
      chain,
    });
    expect(
      await undeployedProvider.signMessageWith6492("test")
    ).toMatchInlineSnapshot(
      '"0x00000000000000000000000000000055c0b4fa41dde26a74435ff03692292fbd000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000000445fbfb9cf000000000000000000000000ef9d7530d16df66481adf291dc9a12b44c7f7df00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000041be34ecce63c5248d5cda407e7da319be3c861e6e2c5d30c9630cd35dcb55e56205c482503552883923f79e751ea3671cbb84d65b18af33cd3034aeb7d529da9a1b000000000000000000000000000000000000000000000000000000000000006492649264926492649264926492649264926492649264926492649264926492"'
    );
  });

  /**
   * Need to add test eth to the counterfactual address for this test to pass.
   * For current balance, @see: https://sepolia.etherscan.io/address/0x7eDdc16B15259E5541aCfdebC46929873839B872
   */
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
  }, 100000);

  it("should fail to execute if account address is not deployed and not correct", async () => {
    const accountAddress = "0xc33AbD9621834CA7c6Fc9f9CC3c47b9c17B03f9F";
    const newProvider = givenConnectedProvider({
      owner,
      chain,
      accountAddress,
    });

    const result = newProvider.sendUserOperation({
      target: await newProvider.getAddress(),
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

  it("should get owner successfully", async () => {
    const provider = givenConnectedProvider({ owner, chain });
    expect(await provider.account.getOwnerAddress()).toMatchInlineSnapshot(
      '"0x65eaA2AfDF6c97295bA44C458abb00FebFB3a5FA"'
    );
    expect(await provider.account.getOwnerAddress()).toBe(
      await owner.getAddress()
    );
  });

  it("should transfer ownership successfully", async () => {
    const provider = givenConnectedProvider({
      owner,
      chain,
    });

    // create a throwaway address
    const throwawayOwner = LocalAccountSigner.privateKeyToAccountSigner(
      generatePrivateKey()
    );
    const throwawayProvider = givenConnectedProvider({
      owner: throwawayOwner,
      chain,
    });

    const oldOwner = await throwawayOwner.getAddress();

    // fund the throwaway address
    await provider.sendTransaction({
      from: await provider.getAddress(),
      to: await throwawayProvider.getAddress(),
      data: "0x",
      value: toHex(1000000000000000n),
    });

    // create new owner and transfer ownership
    const newThrowawayOwner = LocalAccountSigner.privateKeyToAccountSigner(
      generatePrivateKey()
    );
    await LightSmartContractAccount.transferOwnership(
      throwawayProvider,
      newThrowawayOwner,
      true
    );

    const newOwnerViaProvider =
      await throwawayProvider.account.getOwnerAddress();
    const newOwner = await newThrowawayOwner.getAddress();

    expect(newOwnerViaProvider).not.toBe(oldOwner);
    expect(newOwnerViaProvider).toBe(newOwner);
  }, 100000);
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
  const provider = createLightAccountProvider({
    rpcProvider: `${chain.rpcUrls.alchemy.http[0]}/${API_KEY!}`,
    chain,
    owner,
    accountAddress,
    opts: {
      feeOptions,
      txMaxRetries: 100,
    },
  });

  return provider;
};
