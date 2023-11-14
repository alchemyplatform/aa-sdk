import {
  getDefaultEntryPointAddress,
  type BatchUserOperationCallData,
  type SmartAccountSigner,
} from "@alchemy/aa-core";
import {
  encodeAbiParameters,
  parseAbiParameters,
  toHex,
  type Address,
  type HDAccount,
  type Hash,
  type Hex,
} from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { polygonMumbai } from "viem/chains";
import {
  KernelSmartContractAccount,
  type KernelSmartAccountParams,
} from "../account.js";
import { KernelAccountProvider } from "../provider.js";
import type { KernelUserOperationCallData } from "../types.js";
import { KernelBaseValidator, ValidatorMode } from "../validator/base.js";
import { API_KEY, OWNER_MNEMONIC } from "./constants.js";
import { MockSigner } from "./mocks/mock-signer.js";

const chain = polygonMumbai;

describe("Kernel Account Tests", () => {
  //any wallet should work
  const config = {
    chain,
    rpcProvider: `${chain.rpcUrls.alchemy.http[0]}/${API_KEY}`!,
    validatorAddress: "0x180D6465F921C7E0DEA0040107D342c87455fFF5" as Address,
    accountFactoryAddress:
      "0x5D006d3880645ec6e254E18C1F879DAC9Dd71A39" as Address,
    entryPointAddress: getDefaultEntryPointAddress(chain),
  };

  const ownerAccount = mnemonicToAccount(OWNER_MNEMONIC);
  const owner: SmartAccountSigner<HDAccount> = {
    inner: ownerAccount,
    signerType: "aa-sdk-tests",
    signMessage: async (msg) =>
      ownerAccount.signMessage({
        message: { raw: toHex(msg) },
      }),
    getAddress: async () => ownerAccount.address,
    signTypedData: async (params) => {
      return ownerAccount.signTypedData(params);
    },
  };
  const mockOwner = new MockSigner();

  const validator: KernelBaseValidator = new KernelBaseValidator({
    validatorAddress: config.validatorAddress,
    mode: ValidatorMode.sudo,
    owner,
  });

  const mockValidator: KernelBaseValidator = new KernelBaseValidator({
    validatorAddress: config.validatorAddress,
    mode: ValidatorMode.sudo,
    owner: mockOwner,
  });

  const provider = new KernelAccountProvider({
    rpcProvider: config.rpcProvider,
    chain: config.chain,
  });
  const feeDataGetter = async () => ({
    maxFeePerGas: 100_000_000_000n,
    maxPriorityFeePerGas: 100_000_000_000n,
  });
  provider.withFeeDataGetter(feeDataGetter);

  function connect(index: bigint, owner = mockOwner) {
    return provider.connect((_provider) => account(index, owner));
  }

  function account(index: bigint, owner = mockOwner) {
    const accountParams: KernelSmartAccountParams = {
      rpcClient: provider.rpcClient,
      chain: config.chain,
      owner: owner,
      factoryAddress: config.accountFactoryAddress,
      index: index,
      defaultValidator: owner === mockOwner ? mockValidator : validator,
      validator: owner === mockOwner ? mockValidator : validator,
    };
    return new KernelSmartContractAccount(accountParams);
  }

  it("getAddress returns valid counterfactual address", async () => {
    //contract already deployed
    let signerWithProvider = connect(0n);

    expect(await signerWithProvider.getAddress()).eql(
      "0x97925A25C6B8E8902D2c68A4fcd90421a701d2E8"
    );

    //contract already deployed
    signerWithProvider = connect(3n);
    expect(await signerWithProvider.getAddress()).eql(
      "0xA7b2c01A5AfBCf1FAB17aCf95D8367eCcFeEb845"
    );
  });

  it("getNonce returns valid nonce", async () => {
    //contract deployed but no transaction
    const signer: KernelSmartContractAccount = account(0n);
    expect(await signer.getNonce()).eql(0n);

    const signer2: KernelSmartContractAccount = account(3n);
    expect(await signer2.getNonce()).eql(2n);
  });

  it("signWithEip6492 should correctly sign the message", async () => {
    const messageToBeSigned: Hex =
      "0xa70d0af2ebb03a44dcd0714a8724f622e3ab876d0aa312f0ee04823285d6fb1b";
    const magicBytes =
      "6492649264926492649264926492649264926492649264926492649264926492";
    const ownerSignedMessage =
      "0x4d61c5c27fb64b207cbf3bcf60d78e725659cff5f93db9a1316162117dff72aa631761619d93d4d97dfb761ba00b61f9274c6a4a76e494df644d968dd84ddcdb1c";
    const factoryCode =
      "0x296601cd000000000000000000000000180d6465f921c7e0dea0040107d342c87455fff50000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000001448D4d3536cDe7A257087206870c6B6E76e3D4ff4000000000000000000000000";
    const signature =
      encodeAbiParameters(parseAbiParameters("address, bytes, bytes"), [
        config.accountFactoryAddress,
        factoryCode,
        ownerSignedMessage,
      ]) + magicBytes;

    const signer = connect(0n);
    expect(
      await signer.request({
        method: "personal_sign",
        params: [messageToBeSigned, await signer.getAddress()],
      })
    ).toBe(ownerSignedMessage);

    const signer2 = connect(10n);
    expect(
      await signer2.request({
        method: "personal_sign",
        params: [messageToBeSigned, await signer2.getAddress()],
      })
    ).toBe(signature);
  });

  it("sendUserOperation should fail to execute if gas fee not present", async () => {
    let signerWithProvider = connect(1000n);

    const result = signerWithProvider.sendUserOperation({
      target: await signerWithProvider.getAddress(),
      data: "0x",
    });

    await expect(result).rejects.toThrowError(
      /sender balance and deposit together is 0/
    );
  });

  // Only work if you have deposited some matic balance for counterfactual address at entrypoint
  it("sendUserOperation should execute properly", async () => {
    let signerWithProvider = connect(0n, owner);

    const result = await signerWithProvider.sendUserOperation({
      target: await signerWithProvider.getAddress(),
      data: "0x",
      value: 0n,
    });
    const txnHash = signerWithProvider.waitForUserOperationTransaction(
      result.hash as Hash
    );

    await expect(txnHash).resolves.not.toThrowError();
  }, 50000);

  it("sendUserOperation batch should execute properly", async () => {
    let signerWithProvider = connect(0n, owner);
    const request: KernelUserOperationCallData = {
      target: await signerWithProvider.getAddress(),
      data: "0x",
      value: 100000000n,
    };
    const request2: KernelUserOperationCallData = {
      target: await signerWithProvider.getAddress(),
      data: "0x",
      value: 200000000n,
    };
    const requests: BatchUserOperationCallData = [request, request2];
    const result = await signerWithProvider.sendUserOperation(requests);
    const txnHash = signerWithProvider.waitForUserOperationTransaction(
      result.hash as Hash
    );

    await expect(txnHash).resolves.not.toThrowError();
  }, 50000);

  //non core functions
  it("should correctly identify whether account is deployed", async () => {
    //contract already deployed
    const signer2 = account(3n);
    expect(await signer2.isAccountDeployed()).eql(true);

    //contract not deployed
    const signer3 = account(4n);
    expect(await signer3.isAccountDeployed()).eql(false);
  });
});
