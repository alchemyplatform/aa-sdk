import {
  LocalAccountSigner,
  SmartAccountProvider,
  type SmartAccountSigner,
} from "@alchemy/aa-core";
import { isAddress, type Hash } from "viem";
import { generatePrivateKey } from "viem/accounts";
import { sepolia } from "viem/chains";
import LightSmartContractAccount from "../account.js";
import { API_KEY, LIGHT_ACCOUNT_OWNER_MNEMONIC, RPC_URL } from "./constants.js";

const ENTRYPOINT_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const LIGHT_ACCOUNT_FACTORY_ADDRESS =
  "0xDC31c846DA74400C732edb0fE888A2e4ADfBb8b1";
// todo(ajay): replace with official factory address when live

describe("Simple Account Tests", () => {
  const owner: SmartAccountSigner = LocalAccountSigner.mnemonicToAccountSigner(
    LIGHT_ACCOUNT_OWNER_MNEMONIC
  );
  const chain = sepolia;
  const signer = new SmartAccountProvider<LightSmartContractAccount>(
    RPC_URL != null ? RPC_URL : `${chain.rpcUrls.alchemy.http[0]}/${API_KEY}`,
    ENTRYPOINT_ADDRESS,
    chain
  ).connect(
    (provider) =>
      new LightSmartContractAccount({
        entryPointAddress: ENTRYPOINT_ADDRESS,
        chain,
        owner,
        factoryAddress: LIGHT_ACCOUNT_FACTORY_ADDRESS,
        rpcClient: provider,
      })
  );

  it("should succesfully get counterfactual address", async () => {
    expect(await signer.getAddress()).toMatchInlineSnapshot(
      '"0x7eDdc16B15259E5541aCfdebC46929873839B872"'
    );
  });

  it.skip("should sign 6492 typed data successfully", async () => {
    expect(
      await signer.signTypedData({
        types: {
          Request: [{ name: "hello", type: "string" }],
        },
        primaryType: "Request",
        message: {
          hello: "world",
        },
      })
    ).toMatchInlineSnapshot(
      '"0x80b33699de390d928c023db8897b3a3820d8a388aaf951ef54b2605fb6559b231a0c4b07f9d665cd878b76bc81c8185b2cd13b3fcc258009f2db15d37a2f9ade1b"'
    );
  });

  it.skip("should sign 6492 message successfully", async () => {
    expect(await signer.signMessageWith6492("test")).toMatchInlineSnapshot(
      '"0x84826495659cf5d1293472d9dbd3e72e1e48a9bee7ab8ea7c416cd6e1171a9857544ef779d2e70199791a9362ebefc30f88889c7ace073489865ee5889d8a5281b"'
    );
  });

  /**
   * Need to add test eth to the counterfactual address for this test to pass.
   * For current balance, @see: https://sepolia.etherscan.io/address/0x7eDdc16B15259E5541aCfdebC46929873839B872
   */
  it.skip("should execute successfully", async () => {
    const result = await signer.sendUserOperation({
      target: await signer.getAddress(),
      data: "0x",
    });
    const txnHash = signer.waitForUserOperationTransaction(result.hash as Hash);

    await expect(txnHash).resolves.not.toThrowError();
  }, 50000);

  it.skip("should fail to execute if account address is not deployed and not correct", async () => {
    const accountAddress = "0xc33AbD9621834CA7c6Fc9f9CC3c47b9c17B03f9F";
    const newSigner = new SmartAccountProvider(
      RPC_URL != null ? RPC_URL : `${chain.rpcUrls.alchemy.http[0]}/${API_KEY}`,
      ENTRYPOINT_ADDRESS,
      chain
    ).connect(
      (provider) =>
        new LightSmartContractAccount({
          entryPointAddress: ENTRYPOINT_ADDRESS,
          chain,
          owner,
          factoryAddress: LIGHT_ACCOUNT_FACTORY_ADDRESS,
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

  it.skip("should get counterfactual for undeployed account", async () => {
    const owner = LocalAccountSigner.privateKeyToAccountSigner(
      generatePrivateKey()
    );
    const provider = new SmartAccountProvider(
      RPC_URL != null ? RPC_URL : `${chain.rpcUrls.alchemy.http[0]}/${API_KEY}`,
      ENTRYPOINT_ADDRESS,
      chain
    ).connect(
      (rpcClient) =>
        new LightSmartContractAccount({
          entryPointAddress: ENTRYPOINT_ADDRESS,
          chain,
          owner,
          factoryAddress: LIGHT_ACCOUNT_FACTORY_ADDRESS,
          rpcClient,
        })
    );

    const address = provider.getAddress();
    await expect(address).resolves.not.toThrowError();
    expect(isAddress(await address)).toBe(true);
  });

  it("should transfer ownership successfully", async () => {
    // create a throwaway address
    const throwawayOwner = LocalAccountSigner.privateKeyToAccountSigner(
      generatePrivateKey()
    );
    const provider = new SmartAccountProvider<LightSmartContractAccount>(
      RPC_URL != null ? RPC_URL : `${chain.rpcUrls.alchemy.http[0]}/${API_KEY}`,
      ENTRYPOINT_ADDRESS,
      chain
    ).connect(
      (provider) =>
        new LightSmartContractAccount({
          entryPointAddress: ENTRYPOINT_ADDRESS,
          chain,
          owner: throwawayOwner,
          factoryAddress: LIGHT_ACCOUNT_FACTORY_ADDRESS,
          rpcClient: provider,
        })
    );

    // fund the throwaway address
    const fundThrowawayResult = await signer.sendUserOperation({
      target: await provider.getAddress(),
      data: "0x",
      value: BigInt("0x10000000000000"),
    });
    const fundThrowawayTxnHash = signer.waitForUserOperationTransaction(
      fundThrowawayResult.hash
    );
    await expect(fundThrowawayTxnHash).resolves.not.toThrowError();

    // create new owner and transfer ownership
    const newThrowawayOwner = LocalAccountSigner.privateKeyToAccountSigner(
      generatePrivateKey()
    );
    const result = await LightSmartContractAccount.transferOwnership(
      provider,
      newThrowawayOwner
    );
    const txnHash = provider.waitForUserOperationTransaction(result);
    await expect(txnHash).resolves.not.toThrowError();

    expect(await provider.account.getOwner().getAddress()).not.toBe(
      await throwawayOwner.getAddress()
    );
    expect(await provider.account.getOwner().getAddress()).toBe(
      await newThrowawayOwner.getAddress()
    );
  }, 100000);
});
