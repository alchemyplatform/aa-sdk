import { encodeAbiParameters, Hex, parseAbiParameters } from "viem";
import { polygonMumbai } from "viem/chains";
import { KernelBaseValidator, ValidatorMode } from "../validator/base";
import {
  KernelSmartAccountParams,
  KernelSmartContractAccount,
} from "../account";
import { MockSigner } from "./mocks/mock-signer";
import { KernelAccountProvider } from "../provider";
import { PrivateKeySigner } from "@alchemy/aa-core";

describe("Kernel Account Tests", () => {
  //any wallet should work
  const config = {
    privateKey: process.env.OWNER_KEY as Hex,
    ownerWallet: process.env.OWNER_WALLET,
    mockWallet: "0x48D4d3536cDe7A257087206870c6B6E76e3D4ff4",
    chain: polygonMumbai,
    rpcProvider: `${polygonMumbai.rpcUrls.alchemy.http[0]}/${[
      process.env.API_KEY,
    ]}`,
    validatorAddress: "0x180D6465F921C7E0DEA0040107D342c87455fFF5",
    accountFactoryAddress: "0x5D006d3880645ec6e254E18C1F879DAC9Dd71A39",
    entryPointAddress: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
  };

  const owner = PrivateKeySigner.privateKeyToAccountSigner(config.privateKey);
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

  const provider = new KernelAccountProvider(
    config.rpcProvider,
    config.entryPointAddress,
    config.chain
  );

  function connect(index, owner = mockOwner) {
    return provider.connect((provider) => account(index, owner));
  }

  function account(index, owner = mockOwner) {
    const accountParams: KernelSmartAccountParams = {
      rpcClient: provider.rpcClient,
      entryPointAddress: config.entryPointAddress,
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

  it("encodeExecute returns valid encoded hash", async () => {
    const signer: KernelSmartContractAccount = account(0n);
    expect(
      await signer.encodeExecute(
        "0xA7b2c01A5AfBCf1FAB17aCf95D8367eCcFeEb845",
        1n,
        "0x234"
      )
    ).eql(
      "0x51945447000000000000000000000000a7b2c01a5afbcf1fab17acf95d8367eccfeeb84500000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022340000000000000000000000000000000000000000000000000000000000000"
    );
  });

  it("encodeExecuteDelegate returns valid encoded hash", async () => {
    const signer: KernelSmartContractAccount = account(0n);
    expect(
      await signer.encodeExecuteDelegate(
        "0xA7b2c01A5AfBCf1FAB17aCf95D8367eCcFeEb845",
        1n,
        "0x234"
      )
    ).eql(
      "0x51945447000000000000000000000000a7b2c01a5afbcf1fab17acf95d8367eccfeeb84500000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000022340000000000000000000000000000000000000000000000000000000000000"
    );
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

  it("signMessage should correctly sign the message", async () => {
    const messageToBeSigned: Hex =
      "0xa70d0af2ebb03a44dcd0714a8724f622e3ab876d0aa312f0ee04823285d6fb1b";

    const signer: KernelSmartContractAccount = account(0n);
    expect(await signer.signMessage(messageToBeSigned)).toBe(
      "0x000000004d61c5c27fb64b207cbf3bcf60d78e725659cff5f93db9a1316162117dff72aa631761619d93d4d97dfb761ba00b61f9274c6a4a76e494df644d968dd84ddcdb1c"
    );

    const signer2: KernelSmartContractAccount = account(1000n);
    expect(await signer2.signMessage(messageToBeSigned)).toBe(
      "0x000000004d61c5c27fb64b207cbf3bcf60d78e725659cff5f93db9a1316162117dff72aa631761619d93d4d97dfb761ba00b61f9274c6a4a76e494df644d968dd84ddcdb1c"
    );
  });

  //NOTE - this test case will only work if your alchemy endpoint has beta access

  // it("sendUserOperation should fail to execute if gas fee not present", async () => {
  //     let signerWithProvider =  connect(1000n)
  //
  //
  //     const result = signerWithProvider.sendUserOperation({
  //         target: await signerWithProvider.getAddress(),
  //         data: "0x",
  //     });
  //
  //     await expect(result).rejects.toThrowError(/sender balance and deposit together is 0/);
  // });

  //NOTE - this test case will only work if your alchemy endpoint has beta access
  // and you have deposited some matic balance for counterfactual address at entrypoint

  // it("sendUserOperation should execute properly", async () => {
  //     //
  //     let signerWithProvider =  connect(0n,owner)
  //
  //     //to fix bug in old versions
  //     await signerWithProvider.account.getInitCode()
  //     const result = signerWithProvider.sendUserOperation({
  //         target: await signerWithProvider.getAddress(),
  //         data: "0x",
  //         value: 0n
  //     });
  //     await expect(result).resolves.not.toThrowError();
  // });

  //non core functions
  it("should correctly identify whether account is deployed", async () => {
    //contract already deployed
    const signer = account(0n);
    expect(await signer.isAccountDeployed()).eql(true);

    //contract already deployed
    const signer2 = account(3n);
    expect(await signer2.isAccountDeployed()).eql(true);

    //contract not deployed
    const signer3 = account(4n);
    expect(await signer3.isAccountDeployed()).eql(false);

    //contract not deployed
    const signer4 = account(5n);
    expect(await signer4.isAccountDeployed()).eql(false);
  });
});
