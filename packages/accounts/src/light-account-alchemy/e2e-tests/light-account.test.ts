import {
  LocalAccountSigner,
  SmartAccountProvider,
  type SmartAccountSigner,
} from "@alchemy/aa-core";
import { isAddress, type Hash } from "viem";
import { generatePrivateKey } from "viem/accounts";
import { sepolia } from "viem/chains";
import LightSmartContractAccount from "../account.js";
import { API_KEY, OWNER_MNEMONIC, RPC_URL } from "./constants.js";

const ENTRYPOINT_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const LIGHT_ACCOUNT_FACTORY_ADDRESS =
  "0xDC31c846DA74400C732edb0fE888A2e4ADfBb8b1";

describe("Simple Account Tests", () => {
  const owner: SmartAccountSigner =
    LocalAccountSigner.mnemonicToAccountSigner(OWNER_MNEMONIC);
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

  const newOwner: SmartAccountSigner =
    LocalAccountSigner.mnemonicToAccountSigner(OWNER_MNEMONIC);

  it("should succesfully get counterfactual address", async () => {
    expect(await signer.getAddress()).toMatchInlineSnapshot(
      '"0xA95D127D68194A2f8BA5140A14234e7B34241E4a"'
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

  it("should get counterfactual for undeployed account", async () => {
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
    const data = await LightSmartContractAccount.encodeTransferOwnership(
      await newOwner.getAddress()
    );

    const result = await signer.sendUserOperation({
      target: await signer.getAddress(),
      data: data,
    });
    const txnHash = signer.waitForUserOperationTransaction(result.hash as Hash);

    await expect(txnHash).resolves.not.toThrowError();

    expect(await signer.account.getOwner()).toBe(newOwner);
  }, 50000);
});
