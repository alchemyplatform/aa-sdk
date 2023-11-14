import { LocalAccountSigner } from "@alchemy/aa-core";
import { type Address, type Hex } from "viem";
import { generatePrivateKey } from "viem/accounts";
import { polygonMumbai } from "viem/chains";
import {
  KernelSmartContractAccount,
  type KernelSmartAccountParams,
} from "../account.js";
import { KernelAccountProvider } from "../provider.js";
import { KernelBaseValidator, ValidatorMode } from "../validator/base.js";
import { MockSigner } from "./mocks/mock-signer.js";

const chain = polygonMumbai;

describe("Kernel Account Tests", () => {
  //any wallet should work
  const config = {
    privateKey: generatePrivateKey(),
    mockWallet: "0x48D4d3536cDe7A257087206870c6B6E76e3D4ff4",
    chain,
    rpcProvider: `${chain.rpcUrls.alchemy.http[0]}/demo`,
    validatorAddress: "0x180D6465F921C7E0DEA0040107D342c87455fFF5" as Address,
    accountFactoryAddress:
      "0x5D006d3880645ec6e254E18C1F879DAC9Dd71A39" as Address,
  };

  const owner = LocalAccountSigner.privateKeyToAccountSigner(config.privateKey);
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
});
