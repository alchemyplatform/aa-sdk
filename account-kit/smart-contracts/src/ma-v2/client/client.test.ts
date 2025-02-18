import * as AAInfraModule from "@account-kit/infra";
import * as AACoreModule from "@aa-sdk/core";
import {
  erc7677Middleware,
  LocalAccountSigner,
  type SmartAccountSigner,
} from "@aa-sdk/core";
import {
  custom,
  parseEther,
  publicActions,
  zeroAddress,
  getContract,
  hashMessage,
  hashTypedData,
} from "viem";
import { HookType } from "../actions/common/types.js";
import {
  getDefaultPaymasterGuardModuleAddress,
  getDefaultSingleSignerValidationModuleAddress,
  getDefaultTimeRangeModuleAddress,
  getDefaultAllowlistModuleAddress,
  getDefaultNativeTokenLimitModuleAddress,
  installValidationActions,
  SingleSignerValidationModule,
  PaymasterGuardModule,
  TimeRangeModule,
  AllowlistModule,
  NativeTokenLimitModule,
  semiModularAccountBytecodeAbi,
  getDefaultSingleSignerValidationModuleAddress,
} from "@account-kit/smart-contracts/experimental";
import {
  createModularAccountV2Client,
  type SignerEntity,
} from "@account-kit/smart-contracts";
import { local070Instance } from "~test/instances.js";
import { setBalance } from "viem/actions";
import { accounts } from "~test/constants.js";
import { paymaster070 } from "~test/paymaster/paymaster070.js";
import { alchemy, arbitrumSepolia } from "@account-kit/infra";

// TODO: Include a snapshot to reset to in afterEach.
describe("MA v2 Tests", async () => {
  const instance = local070Instance;

  let client: ReturnType<typeof instance.getClient> &
    ReturnType<typeof publicActions>;

  const isValidSigSuccess = "0x1626ba7e";

  beforeAll(async () => {
    client = instance.getClient().extend(publicActions);
  });

  const signer: SmartAccountSigner = new LocalAccountSigner(
    accounts.fundedAccountOwner
  );

  const sessionKey: SmartAccountSigner = new LocalAccountSigner(
    accounts.unfundedAccountOwner
  );

  const target = "0x000000000000000000000000000000000000dEaD";
  const sendAmount = parseEther("1");

  const getTargetBalance = async (): Promise<bigint> =>
    client.getBalance({
      address: target,
    });

  it("sends a simple UO", async () => {
    const provider = await givenConnectedProvider({ signer });

    await setBalance(instance.getClient(), {
      address: provider.getAddress(),
      value: parseEther("2"),
    });

    const startingAddressBalance = await getTargetBalance();

    const result = await provider.sendUserOperation({
      uo: {
        target: target,
        value: sendAmount,
        data: "0x",
      },
    });

    await provider.waitForUserOperationTransaction(result);

    await expect(getTargetBalance()).resolves.toEqual(
      startingAddressBalance + sendAmount
    );
  });

  it("successfully sign + validate a message, for native and single signer validation", async () => {
    const provider = (await givenConnectedProvider({ signer })).extend(
      installValidationActions
    );

    await setBalance(instance.getClient(), {
      address: provider.getAddress(),
      value: parseEther("2"),
    });

    const accountContract = getContract({
      address: provider.getAddress(),
      abi: semiModularAccountBytecodeAbi,
      client,
    });

    // UO deploys the account to test 1271 against
    const result = await provider.installValidation({
      validationConfig: {
        moduleAddress: getDefaultSingleSignerValidationModuleAddress(
          provider.chain
        ),
        entityId: 1,
        isGlobal: true,
        isSignatureValidation: true,
        isUserOpValidation: true,
      },
      selectors: [],
      installData: SingleSignerValidationModule.encodeOnInstallData({
        entityId: 1,
        signer: await sessionKey.getAddress(),
      }),
      hooks: [],
    });

    await provider.waitForUserOperationTransaction(result);

    const message = "testmessage";

    let signature = await provider.signMessage({ message });

    await expect(
      accountContract.read.isValidSignature([hashMessage(message), signature])
    ).resolves.toEqual(isValidSigSuccess);

    // connect session key
    let sessionKeyClient = await createModularAccountV2Client({
      chain: instance.chain,
      signer: sessionKey,
      transport: custom(instance.getClient()),
      accountAddress: provider.getAddress(),
      signerEntity: { entityId: 1, isGlobalValidation: true },
    });

    signature = await sessionKeyClient.signMessage({ message });

    await expect(
      accountContract.read.isValidSignature([hashMessage(message), signature])
    ).resolves.toEqual(isValidSigSuccess);
  });

  it("successfully sign + validate typed data messages, for native and single signer validation", async () => {
    const provider = (await givenConnectedProvider({ signer })).extend(
      installValidationActions
    );

    await setBalance(instance.getClient(), {
      address: provider.getAddress(),
      value: parseEther("2"),
    });

    const accountContract = getContract({
      address: provider.getAddress(),
      abi: semiModularAccountBytecodeAbi,
      client,
    });

    // UO deploys the account to test 1271 against
    const result = await provider.installValidation({
      validationConfig: {
        moduleAddress: getDefaultSingleSignerValidationModuleAddress(
          provider.chain
        ),
        entityId: 1,
        isGlobal: true,
        isSignatureValidation: true,
        isUserOpValidation: true,
      },
      selectors: [],
      installData: SingleSignerValidationModule.encodeOnInstallData({
        entityId: 1,
        signer: await sessionKey.getAddress(),
      }),
      hooks: [],
    });

    await provider.waitForUserOperationTransaction(result);

    const typedData = {
      domain: {
        name: "Ether Mail",
        version: "1",
        chainId: 1,
        verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
      },
      types: {
        Person: [
          { name: "name", type: "string" },
          { name: "wallet", type: "address" },
        ],
        Mail: [
          { name: "from", type: "Person" },
          { name: "to", type: "Person" },
          { name: "contents", type: "string" },
        ],
      },
      primaryType: "Mail",
      message: {
        from: {
          name: "Cow",
          wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
        },
        to: {
          name: "Bob",
          wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
        },
        contents: "Hello, Bob!",
      },
    } as const;

    const hashedMessageTypedData = hashTypedData(typedData);
    let signature = await provider.signTypedData({ typedData });

    await expect(
      accountContract.read.isValidSignature([hashedMessageTypedData, signature])
    ).resolves.toEqual(isValidSigSuccess);

    // connect session key
    let sessionKeyClient = await createModularAccountV2Client({
      chain: instance.chain,
      signer: sessionKey,
      transport: custom(instance.getClient()),
      accountAddress: provider.getAddress(),
      signerEntity: { entityId: 1, isGlobalValidation: true },
    });

    signature = await sessionKeyClient.signTypedData({ typedData });

    await expect(
      accountContract.read.isValidSignature([hashedMessageTypedData, signature])
    ).resolves.toEqual(isValidSigSuccess);
  });

  it("adds a session key with no permissions", async () => {
    let provider = (await givenConnectedProvider({ signer })).extend(
      installValidationActions
    );

    await setBalance(client, {
      address: provider.getAddress(),
      value: parseEther("2"),
    });

    let result = await provider.installValidation({
      validationConfig: {
        moduleAddress: getDefaultSingleSignerValidationModuleAddress(
          provider.chain
        ),
        entityId: 1,
        isGlobal: true,
        isSignatureValidation: true,
        isUserOpValidation: true,
      },
      selectors: [],
      installData: SingleSignerValidationModule.encodeOnInstallData({
        entityId: 1,
        signer: await sessionKey.getAddress(),
      }),
      hooks: [],
    });

    await provider.waitForUserOperationTransaction(result);

    const startingAddressBalance = await getTargetBalance();

    // connect session key and send tx with session key
    let sessionKeyClient = await createModularAccountV2Client({
      chain: instance.chain,
      signer: sessionKey,
      transport: custom(instance.getClient()),
      accountAddress: provider.getAddress(),
      signerEntity: { entityId: 1, isGlobalValidation: true },
    });

    result = await sessionKeyClient.sendUserOperation({
      uo: {
        target: target,
        value: sendAmount,
        data: "0x",
      },
    });

    await sessionKeyClient.waitForUserOperationTransaction(result);

    await expect(getTargetBalance()).resolves.toEqual(
      startingAddressBalance + sendAmount
    );
  });

  it("uninstalls a session key", async () => {
    let provider = (await givenConnectedProvider({ signer })).extend(
      installValidationActions
    );

    await setBalance(client, {
      address: provider.getAddress(),
      value: parseEther("2"),
    });

    let result = await provider.installValidation({
      validationConfig: {
        moduleAddress: getDefaultSingleSignerValidationModuleAddress(
          provider.chain
        ),
        entityId: 1,
        isGlobal: true,
        isSignatureValidation: true,
        isUserOpValidation: true,
      },
      selectors: [],
      installData: SingleSignerValidationModule.encodeOnInstallData({
        entityId: 1,
        signer: await sessionKey.getAddress(),
      }),
      hooks: [],
    });

    await provider.waitForUserOperationTransaction(result);

    result = await provider.uninstallValidation({
      moduleAddress: getDefaultSingleSignerValidationModuleAddress(
        provider.chain
      ),
      entityId: 1,
      uninstallData: SingleSignerValidationModule.encodeOnUninstallData({
        entityId: 1,
      }),
      hookUninstallDatas: [],
    });

    await provider.waitForUserOperationTransaction(result);

    // connect session key and send tx with session key
    let sessionKeyClient = await createModularAccountV2Client({
      chain: instance.chain,
      signer: sessionKey,
      transport: custom(instance.getClient()),
      accountAddress: provider.getAddress(),
      signerEntity: { entityId: 1, isGlobalValidation: true },
    });

    await expect(
      sessionKeyClient.sendUserOperation({
        uo: {
          target: target,
          value: sendAmount,
          data: "0x",
        },
      })
    ).rejects.toThrowError();
  });

  it("installs paymaster guard module, verifies use of valid paymaster, then uninstalls module", async () => {
    let provider = (
      await givenConnectedProvider({
        signer,
        usePaymaster: true,
      })
    ).extend(installValidationActions);

    await setBalance(client, {
      address: provider.getAddress(),
      value: parseEther("2"),
    });

    const paymaster = paymaster070.getPaymasterStubData();

    const hookInstallData = PaymasterGuardModule.encodeOnInstallData({
      entityId: 1,
      paymaster: "paymaster" in paymaster ? paymaster.paymaster : "0x0", // dummy value for paymaster address if it DNE
    });

    const installResult = await provider.installValidation({
      validationConfig: {
        moduleAddress: getDefaultSingleSignerValidationModuleAddress(
          provider.chain
        ),
        entityId: 1,
        isGlobal: true,
        isSignatureValidation: true,
        isUserOpValidation: true,
      },
      selectors: [],
      installData: SingleSignerValidationModule.encodeOnInstallData({
        entityId: 1,
        signer: await sessionKey.getAddress(),
      }),
      hooks: [
        {
          hookConfig: {
            address: getDefaultPaymasterGuardModuleAddress(provider.chain),
            entityId: 1, // uint32
            hookType: HookType.VALIDATION,
            hasPreHooks: true,
            hasPostHooks: true,
          },
          initData: hookInstallData,
        },
      ],
    });

    // verify hook installtion succeeded
    await provider.waitForUserOperationTransaction(installResult);

    // create session key client
    const sessionKeyProvider = (
      await givenConnectedProvider({
        signer: sessionKey,
        accountAddress: provider.account.address,
        usePaymaster: true,
        signerEntity: { entityId: 1, isGlobalValidation: true },
      })
    ).extend(installValidationActions);

    // happy path: send a UO with correct paymaster
    const result = await sessionKeyProvider.sendUserOperation({
      uo: {
        target: target,
        value: sendAmount,
        data: "0x",
      },
    });

    // verify if correct paymaster is used
    const txnHash1 = sessionKeyProvider.waitForUserOperationTransaction(result);
    await expect(txnHash1).resolves.not.toThrowError();

    const hookUninstallData = PaymasterGuardModule.encodeOnUninstallData({
      entityId: 1,
    });

    const uninstallResult = await provider.uninstallValidation({
      moduleAddress: zeroAddress,
      entityId: 1,
      uninstallData: "0x",
      hookUninstallDatas: [hookUninstallData],
    });

    // verify uninstall
    await expect(
      provider.waitForUserOperationTransaction(uninstallResult)
    ).resolves.not.toThrowError();
  });

  it("installs paymaster guard module, verifies use of invalid paymaster, then uninstalls module", async () => {
    let provider = (
      await givenConnectedProvider({
        signer,
        usePaymaster: true,
      })
    ).extend(installValidationActions);

    await setBalance(client, {
      address: provider.getAddress(),
      value: parseEther("2"),
    });

    const paymaster = paymaster070.getPaymasterStubData();

    const hookInstallData = PaymasterGuardModule.encodeOnInstallData({
      entityId: 1,
      paymaster: "paymaster" in paymaster ? paymaster.paymaster : "0x0", // dummy value for paymaster address if it DNE
    });

    const installResult = await provider.installValidation({
      validationConfig: {
        moduleAddress: getDefaultSingleSignerValidationModuleAddress(
          provider.chain
        ),
        entityId: 1,
        isGlobal: true,
        isSignatureValidation: true,
        isUserOpValidation: true,
      },
      selectors: [],
      installData: SingleSignerValidationModule.encodeOnInstallData({
        entityId: 1,
        signer: await sessionKey.getAddress(),
      }),
      hooks: [
        {
          hookConfig: {
            address: getDefaultPaymasterGuardModuleAddress(provider.chain),
            entityId: 1, // uint32
            hookType: HookType.VALIDATION,
            hasPreHooks: true,
            hasPostHooks: true,
          },
          initData: hookInstallData,
        },
      ],
    });

    // verify hook installtion succeeded
    await provider.waitForUserOperationTransaction(installResult);

    // sad path: send UO with no paymaster
    // create session key client
    const sessionKeyProvider = (
      await givenConnectedProvider({
        signer: sessionKey,
        accountAddress: provider.account.address,
        usePaymaster: false,
        signerEntity: { entityId: 1, isGlobalValidation: true },
      })
    ).extend(installValidationActions);

    await expect(
      sessionKeyProvider.sendUserOperation({
        uo: {
          target: target,
          value: sendAmount,
          data: "0x",
        },
      })
    ).rejects.toThrowError();

    const hookUninstallData = PaymasterGuardModule.encodeOnUninstallData({
      entityId: 1,
    });

    const uninstallResult = await provider.uninstallValidation({
      moduleAddress: zeroAddress,
      entityId: 1,
      uninstallData: "0x",
      hookUninstallDatas: [hookUninstallData],
    });

    // verify uninstall
    await expect(
      provider.waitForUserOperationTransaction(uninstallResult)
    ).resolves.not.toThrowError();
  });

  it("installs allowlist module, uses, then uninstalls", async () => {
    let provider = (await givenConnectedProvider({ signer })).extend(
      installValidationActions
    );

    await setBalance(client, {
      address: provider.getAddress(),
      value: parseEther("2"),
    });

    // install validation module
    const installResult = await provider.installValidation({
      validationConfig: {
        moduleAddress: getDefaultSingleSignerValidationModuleAddress(
          provider.chain
        ),
        entityId: 1,
        isGlobal: true,
        isSignatureValidation: true,
        isUserOpValidation: true,
      },
      selectors: [],
      installData: SingleSignerValidationModule.encodeOnInstallData({
        entityId: 1,
        signer: await sessionKey.getAddress(),
      }),
      hooks: [],
    });

    await provider.waitForUserOperationTransaction(installResult);

    // create session key client
    const sessionKeyProvider = (
      await givenConnectedProvider({
        signer: sessionKey,
        accountAddress: provider.account.address,
        signerEntity: { entityId: 1, isGlobalValidation: true },
      })
    ).extend(installValidationActions);

    // verify we can call into the zero address before allow list hook is installed
    const sendResultBeforeHookInstallation =
      await sessionKeyProvider.sendUserOperation({
        uo: {
          target: zeroAddress,
          value: 0n,
          data: "0x",
        },
      });

    await provider.waitForUserOperationTransaction(
      sendResultBeforeHookInstallation
    );

    const hookInstallData = AllowlistModule.encodeOnInstallData({
      entityId: 1,
      inputs: [
        {
          target,
          hasSelectorAllowlist: false,
          hasERC20SpendLimit: false,
          erc20SpendLimit: 0n,
          selectors: [],
        },
      ],
    });

    // install hook
    const installHookResult = await provider.installValidation({
      validationConfig: {
        moduleAddress: getDefaultSingleSignerValidationModuleAddress(
          provider.chain
        ),
        entityId: 1,
        isGlobal: true,
        isSignatureValidation: true,
        isUserOpValidation: true,
      },
      selectors: [],
      installData: SingleSignerValidationModule.encodeOnInstallData({
        entityId: 1,
        signer: await sessionKey.getAddress(),
      }),
      hooks: [
        {
          hookConfig: {
            address: getDefaultAllowlistModuleAddress(provider.chain),
            entityId: 1, // uint32
            hookType: HookType.VALIDATION,
            hasPreHooks: true,
            hasPostHooks: false,
          },
          initData: hookInstallData,
        },
      ],
    });

    await provider.waitForUserOperationTransaction(installHookResult);

    // Test that the allowlist is active.
    // We should *only* be able to call into the target address, as it's the only address we passed to onInstall.
    const sendResult = await sessionKeyProvider.sendUserOperation({
      uo: {
        target: target,
        value: 0n,
        data: "0x",
      },
    });

    await provider.waitForUserOperationTransaction(sendResult);

    // This should revert as we're calling an address separate fom the allowlisted target.
    await expect(
      sessionKeyProvider.sendUserOperation({
        uo: {
          target: zeroAddress,
          value: 0n,
          data: "0x",
        },
      })
    ).rejects.toThrowError();

    const hookUninstallData = AllowlistModule.encodeOnUninstallData({
      entityId: 1,
      inputs: [
        {
          target,
          hasSelectorAllowlist: false,
          hasERC20SpendLimit: false,
          erc20SpendLimit: 0n,
          selectors: [],
        },
      ],
    });

    const uninstallResult = await provider.uninstallValidation({
      moduleAddress: getDefaultSingleSignerValidationModuleAddress(
        provider.chain
      ),
      entityId: 1,
      uninstallData: SingleSignerValidationModule.encodeOnInstallData({
        entityId: 1,
        signer: await sessionKey.getAddress(),
      }),
      hookUninstallDatas: [hookUninstallData],
    });

    await provider.waitForUserOperationTransaction(uninstallResult);
  });

  it("installs native token limit module, uses, then uninstalls", async () => {
    let provider = (await givenConnectedProvider({ signer })).extend(
      installValidationActions
    );

    await setBalance(client, {
      address: provider.getAddress(),
      value: parseEther("2"),
    });

    const spendLimit = parseEther("0.5");

    // Let's verify the module's limit is set correctly after installation
    const hookInstallData = NativeTokenLimitModule.encodeOnInstallData({
      entityId: 0,
      spendLimit,
    });

    const installResult = await provider.installValidation({
      validationConfig: {
        moduleAddress: zeroAddress,
        entityId: 0,
        isGlobal: true,
        isSignatureValidation: true,
        isUserOpValidation: true,
      },
      selectors: [],
      installData: "0x",
      hooks: [
        {
          hookConfig: {
            address: getDefaultNativeTokenLimitModuleAddress(provider.chain),
            entityId: 0,
            hookType: HookType.VALIDATION,
            hasPreHooks: true,
            hasPostHooks: false,
          },
          initData: hookInstallData,
        },
        {
          hookConfig: {
            address: getDefaultNativeTokenLimitModuleAddress(provider.chain),
            entityId: 0,
            hookType: HookType.EXECUTION,
            hasPreHooks: true,
            hasPostHooks: false,
          },
          initData: "0x",
        },
      ],
    });

    await provider.waitForUserOperationTransaction(installResult);

    // Try to send less than the limit - should pass
    const passingSendResult = await provider.sendUserOperation({
      uo: {
        target: target,
        value: parseEther("0.05"), // below the 0.5 limit
        data: "0x",
      },
    });
    await provider.waitForUserOperationTransaction(passingSendResult);

    // Try to send more than the limit - should fail
    await expect(
      provider.sendUserOperation({
        uo: {
          target: target,
          value: parseEther("0.6"), // passing the 0.5 limit
          data: "0x",
        },
      })
    ).rejects.toThrowError();

    const hookUninstallData = NativeTokenLimitModule.encodeOnUninstallData({
      entityId: 0,
    });

    const uninstallResult = await provider.uninstallValidation({
      moduleAddress: zeroAddress,
      entityId: 0,
      uninstallData: "0x",
      hookUninstallDatas: [hookUninstallData, "0x"],
    });

    await provider.waitForUserOperationTransaction(uninstallResult);

    // Sending over the limit should now pass
    const postUninstallSendResult = await provider.sendUserOperation({
      uo: {
        target: target,
        value: parseEther("0.6"),
        data: "0x",
      },
    });
    await provider.waitForUserOperationTransaction(postUninstallSendResult);
  });

  it("installs time range module, then uninstalls module within valid time range", async () => {
    let provider = (
      await givenConnectedProvider({
        signer,
      })
    ).extend(installValidationActions);

    await setBalance(client, {
      address: provider.getAddress(),
      value: parseEther("2"),
    });

    const hookInstallData = TimeRangeModule.encodeOnInstallData({
      entityId: 0,
      validAfter: 0,
      validUntil: 10000000000,
    });

    const installResult = await provider.installValidation({
      validationConfig: {
        moduleAddress: zeroAddress,
        entityId: 0,
        isGlobal: true,
        isSignatureValidation: true,
        isUserOpValidation: true,
      },
      selectors: [],
      installData: "0x",
      hooks: [
        {
          hookConfig: {
            address: getDefaultTimeRangeModuleAddress(provider.chain),
            entityId: 0, // uint32
            hookType: HookType.VALIDATION,
            hasPreHooks: true,
            hasPostHooks: true,
          },
          initData: hookInstallData,
        },
      ],
    });

    // verify hook installtion succeeded
    await provider.waitForUserOperationTransaction(installResult);

    const hookUninstallData = TimeRangeModule.encodeOnUninstallData({
      entityId: 0,
    });

    const uninstallResult = await provider.uninstallValidation({
      moduleAddress: zeroAddress,
      entityId: 0,
      uninstallData: "0x",
      hookUninstallDatas: [hookUninstallData],
    });

    // verify uninstall
    await expect(
      provider.waitForUserOperationTransaction(uninstallResult)
    ).resolves.not.toThrowError();
  });

  it("installs time range module, then uninstalls module outside valid time range", async () => {
    let provider = (
      await givenConnectedProvider({
        signer,
      })
    ).extend(installValidationActions);

    await setBalance(client, {
      address: provider.getAddress(),
      value: parseEther("2"),
    });

    const hookInstallData = TimeRangeModule.encodeOnInstallData({
      entityId: 0,
      validAfter: 0,
      validUntil: 1,
    });

    const installResult = await provider.installValidation({
      validationConfig: {
        moduleAddress: zeroAddress,
        entityId: 0,
        isGlobal: true,
        isSignatureValidation: true,
        isUserOpValidation: true,
      },
      selectors: [],
      installData: "0x",
      hooks: [
        {
          hookConfig: {
            address: getDefaultTimeRangeModuleAddress(provider.chain),
            entityId: 0, // uint32
            hookType: HookType.VALIDATION,
            hasPreHooks: true,
            hasPostHooks: true,
          },
          initData: hookInstallData,
        },
      ],
    });

    // verify hook installation succeeded
    await provider.waitForUserOperationTransaction(installResult);

    const hookUninstallData = TimeRangeModule.encodeOnUninstallData({
      entityId: 0,
    });

    const uninstallResult = await provider.uninstallValidation({
      moduleAddress: zeroAddress,
      entityId: 0,
      uninstallData: "0x",
      hookUninstallDatas: [hookUninstallData],
    });

    // uninstall should fail
    await expect(
      provider.waitForUserOperationTransaction(uninstallResult)
    ).rejects.toThrowError();
  });

  const givenConnectedProvider = async ({
    signer,
    accountAddress,
    usePaymaster = false,
    signerEntity,
  }: {
    signer: SmartAccountSigner;
    accountAddress?: `0x${string}`;
    usePaymaster?: boolean;
    signerEntity?: SignerEntity;
  }) =>
    createModularAccountV2Client({
      chain: instance.chain,
      signer,
      accountAddress,
      signerEntity,
      transport: custom(instance.getClient()),
      ...(usePaymaster ? erc7677Middleware() : {}),
    });

  it("alchemy client calls the createAlchemySmartAccountClient", async () => {
    const alchemyClientSpy = vi
      .spyOn(AAInfraModule, "createAlchemySmartAccountClient")
      .mockImplementation(() => "fakedAlchemy" as any);
    const notAlchemyClientSpy = vi
      .spyOn(AACoreModule, "createSmartAccountClient")
      .mockImplementation(() => "faked" as any);
    expect(
      await createModularAccountV2Client({
        chain: arbitrumSepolia,
        signer,
        transport: alchemy({ jwt: "AN_API_KEY" }),
        accountAddress: "0x86f3B0211764971Ad0Fc8C8898d31f5d792faD84",
      })
    ).toMatch("fakedAlchemy");

    expect(alchemyClientSpy).toHaveBeenCalled();
    expect(notAlchemyClientSpy).not.toHaveBeenCalled();
  });
  it("custom client calls the createAlchemySmartAccountClient", async () => {
    const alchemyClientSpy = vi
      .spyOn(AAInfraModule, "createAlchemySmartAccountClient")
      .mockImplementation(() => "fakedAlchemy" as any);
    const notAlchemyClientSpy = vi
      .spyOn(AACoreModule, "createSmartAccountClient")
      .mockImplementation(() => "faked" as any);
    expect(
      await createModularAccountV2Client({
        chain: instance.chain,
        signer,
        transport: custom(instance.getClient()),
      })
    ).toMatch("faked");

    expect(alchemyClientSpy).not.toHaveBeenCalled();
    expect(notAlchemyClientSpy).toHaveBeenCalled();
  });
});
