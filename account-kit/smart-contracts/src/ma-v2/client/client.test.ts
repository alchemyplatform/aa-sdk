import { custom, parseEther, publicActions, zeroAddress } from "viem";
import {
  erc7677Middleware,
  LocalAccountSigner,
  type SmartAccountSigner,
} from "@aa-sdk/core";
import { createSMAV2AccountClient } from "./client.js";
import { local070Instance } from "~test/instances.js";
import { setBalance } from "viem/actions";
import { accounts } from "~test/constants.js";
import {
  getDefaultPaymasterGuardModuleAddress,
  getDefaultSingleSignerValidationModuleAddress,
  getDefaultTimeRangeModuleAddress,
  getDefaultAllowlistModuleAddress,
  getDefaultNativeTokenLimitModuleAddress,
} from "../modules/utils.js";
import { SingleSignerValidationModule } from "../modules/single-signer-validation/module.js";
import { installValidationActions } from "../actions/install-validation/installValidation.js";
import { paymaster070 } from "~test/paymaster/paymaster070.js";
import { PaymasterGuardModule } from "../modules/paymaster-guard-module/module.js";
import { HookType } from "../actions/common/types.js";
import { TimeRangeModule } from "../modules/time-range-module/module.js";
import { allowlistModule } from "../modules/allowlist-module/module.js";
import { nativeTokenLimitModule } from "../modules/native-token-limit-module/module.js";

describe("MA v2 Tests", async () => {
  const instance = local070Instance;
  let client: ReturnType<typeof instance.getClient> &
    ReturnType<typeof publicActions>;

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

    let txnHash = provider.waitForUserOperationTransaction(result);
    await expect(txnHash).resolves.not.toThrowError();

    const startingAddressBalance = await getTargetBalance();

    // connect session key and send tx with session key
    let sessionKeyClient = await createSMAV2AccountClient({
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

    txnHash = sessionKeyClient.waitForUserOperationTransaction(result);
    await expect(txnHash).resolves.not.toThrowError();
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

    let txnHash = provider.waitForUserOperationTransaction(result);
    await expect(txnHash).resolves.not.toThrowError();

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

    txnHash = provider.waitForUserOperationTransaction(result);
    await expect(txnHash).resolves.not.toThrowError();

    // connect session key and send tx with session key
    let sessionKeyClient = await createSMAV2AccountClient({
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
      entityId: 0,
      paymaster: "paymaster" in paymaster ? paymaster.paymaster : "0x0", // dummy value for paymaster address if it DNE
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
            address: getDefaultPaymasterGuardModuleAddress(provider.chain),
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

    // happy path: send a UO with correct paymaster
    const result = await provider.sendUserOperation({
      uo: {
        target: target,
        value: sendAmount,
        data: "0x",
      },
    });

    // verify if correct paymaster is used
    const txnHash1 = provider.waitForUserOperationTransaction(result);
    await expect(txnHash1).resolves.not.toThrowError();

    const hookUninstallData = PaymasterGuardModule.encodeOnUninstallData({
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
      entityId: 0,
      paymaster: "paymaster" in paymaster ? paymaster.paymaster : "0x0", // dummy value for paymaster address if it DNE
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
            address: getDefaultPaymasterGuardModuleAddress(provider.chain),
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

    // sad path: send UO with no paymaster
    let providerNoPaymaster = await givenConnectedProvider({
      signer,
      usePaymaster: false,
    });

    await expect(
      providerNoPaymaster.sendUserOperation({
        uo: {
          target: target,
          value: sendAmount,
          data: "0x",
        },
      })
    ).rejects.toThrowError();

    const hookUninstallData = PaymasterGuardModule.encodeOnUninstallData({
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

    // uninstall should fail
    await expect(
      provider.waitForUserOperationTransaction(uninstallResult)
    ).rejects.toThrowError();
  });
  
  it("installs allowlist module, uses, then uninstalls", async () => {
    let provider = (await givenConnectedProvider({ signer })).extend(
      installValidationActions
    );

    await setBalance(client, {
      address: provider.getAddress(),
      value: parseEther("2"),
    });

    const hookInstallData = allowlistModule.encodeOnInstallData({
      entityId: 0,
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
            address: getDefaultAllowlistModuleAddress(provider.chain),
            entityId: 0, // uint32
            hookType: HookType.VALIDATION,
            hasPreHooks: true,
            hasPostHooks: false,
          },
          initData: hookInstallData,
        },
      ],
    });

    await expect(
      provider.waitForUserOperationTransaction(installResult)
    ).resolves.not.toThrowError();

    // Test that the allowlist is active.
    // We should *only* be able to call into the target address, as it's the only address we passed to onInstall.
    const sendResult = await provider.sendUserOperation({
      uo: {
        target: target,
        value: 0n,
        data: "0x",
      },
    });
    await expect(
      provider.waitForUserOperationTransaction(sendResult)
    ).resolves.not.toThrowError();

    // This should revert as we're calling an address separate fom the allowlisted target.
    await expect(
      provider.sendUserOperation({
        uo: {
          target: zeroAddress,
          value: 0n,
          data: "0x",
        },
      })
    ).rejects.toThrowError();

    const hookUninstallData = allowlistModule.encodeOnUninstallData({
      entityId: 0,
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
      moduleAddress: zeroAddress,
      entityId: 0,
      uninstallData: "0x",
      hookUninstallDatas: [hookUninstallData],
    });

    await expect(
      provider.waitForUserOperationTransaction(uninstallResult)
    ).resolves.not.toThrowError();

    // Post-uninstallation, we should now be able to call into any address successfully.
    const postUninstallSendResult = await provider.sendUserOperation({
      uo: {
        target: zeroAddress,
        value: 0n,
        data: "0x",
      },
    });
    await expect(
      provider.waitForUserOperationTransaction(postUninstallSendResult)
    ).resolves.not.toThrowError();
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
    const hookInstallData = nativeTokenLimitModule.encodeOnInstallData({
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

    await expect(
      provider.waitForUserOperationTransaction(installResult)
    ).resolves.not.toThrowError();

    // Try to send less than the limit - should pass
    const passingSendResult = await provider.sendUserOperation({
      uo: {
        target: target,
        value: parseEther("0.05"), // below the 0.5 limit
        data: "0x",
      },
    });
    await expect(
      provider.waitForUserOperationTransaction(passingSendResult)
    ).resolves.not.toThrowError();

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

    const hookUninstallData = nativeTokenLimitModule.encodeOnUninstallData({
      entityId: 0,
    });

    const uninstallResult = await provider.uninstallValidation({
      moduleAddress: zeroAddress,
      entityId: 0,
      uninstallData: "0x",
      hookUninstallDatas: [hookUninstallData, "0x"],
    });

    await expect(
      provider.waitForUserOperationTransaction(uninstallResult)
    ).resolves.not.toThrowError();

    // Sending over the limit should now pass
    const postUninstallSendResult = await provider.sendUserOperation({
      uo: {
        target: target,
        value: parseEther("0.6"),
        data: "0x",
      },
    });
    await expect(
      provider.waitForUserOperationTransaction(postUninstallSendResult)
    ).resolves.not.toThrowError();
  });

  const givenConnectedProvider = async ({
    signer,
    accountAddress,
    usePaymaster = false,
  }: {
    signer: SmartAccountSigner;
    accountAddress?: `0x${string}`;
    usePaymaster?: boolean;
  }) =>
    createSMAV2AccountClient({
      chain: instance.chain,
      signer,
      accountAddress,
      transport: custom(instance.getClient()),
      ...(usePaymaster ? erc7677Middleware() : {}),
    });
});
