import {
  LocalAccountSigner,
  type SmartAccountSigner,
  erc7677Middleware,
} from "@aa-sdk/core";
import { type Address, custom, parseEther } from "viem";
import { setBalance } from "viem/actions";
import { local060Instance } from "~test/instances.js";
import { createMultiOwnerModularAccountClient } from "./client.js";

describe("Modular Account Multi Owner Account Tests", async () => {
  const instance = local060Instance;
  const MODULAR_MULTIOWNER_ACCOUNT_OWNER_MNEMONIC =
    "indoor dish desk flag debris potato excuse depart ticket judge file exit";

  const signer1 = LocalAccountSigner.mnemonicToAccountSigner(
    MODULAR_MULTIOWNER_ACCOUNT_OWNER_MNEMONIC,
    { accountIndex: 0 }
  );

  const signer2 = LocalAccountSigner.mnemonicToAccountSigner(
    MODULAR_MULTIOWNER_ACCOUNT_OWNER_MNEMONIC,
    { accountIndex: 1 }
  );

  const owners = [await signer1.getAddress(), await signer2.getAddress()];

  it("should successfully get counterfactual address", async () => {
    const provider = await givenConnectedProvider({
      signer: signer1,
      owners,
    });
    expect(provider.getAddress()).toMatchInlineSnapshot(
      `"0xE599B1c2cecFbAa007Bea0e6FBeD1dc1757fDd89"`
    );
  });

  it("should execute successfully using the first signer", async () => {
    const provider = await givenConnectedProvider({
      signer: signer1,
      owners,
    });

    await setBalance(instance.getClient(), {
      address: provider.getAddress(),
      value: parseEther("1"),
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

  it("should execute successfully using the second signer", async () => {
    const provider = await givenConnectedProvider({
      signer: signer2,
      owners,
    });

    await setBalance(instance.getClient(), {
      address: provider.getAddress(),
      value: parseEther("1"),
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

  it("should fail to execute if account address is not deployed and not correct", async () => {
    const accountAddress = "0xc33AbD9621834CA7c6Fc9f9CC3c47b9c17B03f9F";
    const provider = await givenConnectedProvider({
      signer: signer1,
      accountAddress,
      owners,
    });

    const result = provider.sendUserOperation({
      uo: {
        target: provider.getAddress(),
        data: "0x",
      },
    });

    await expect(result).rejects.toThrowError();
  });

  it("should successfully execute with paymaster", async () => {
    const provider = await givenConnectedProvider({
      signer: signer1,
      owners,
      usePaymaster: true,
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

  it("should successfully override fees and gas when using paymaster", async () => {
    const provider = await givenConnectedProvider({
      signer: signer1,
      owners,
      usePaymaster: true,
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
        "callGasLimit": 1n,
        "maxFeePerGas": 1n,
        "maxPriorityFeePerGas": 1n,
        "preVerificationGas": 1n,
        "verificationGasLimit": 1n,
      }
    `);
  }, 100000);

  const givenConnectedProvider = ({
    signer,
    accountAddress,
    owners,
    usePaymaster = false,
  }: {
    signer: SmartAccountSigner;
    owners: Address[];
    usePaymaster?: boolean;
    accountAddress?: Address;
  }) =>
    createMultiOwnerModularAccountClient({
      signer,
      accountAddress,
      owners,
      transport: custom(instance.getClient()),
      chain: instance.chain,
      ...(usePaymaster ? erc7677Middleware() : {}),
    });
});
