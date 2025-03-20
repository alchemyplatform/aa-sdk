import * as AAInfraModule from "@account-kit/infra";
import * as AACoreModule from "@aa-sdk/core";
import {
  erc7677Middleware,
  LocalAccountSigner,
  createSmartAccountClient,
  type SmartAccountSigner,
  type UserOperationRequest_v7,
} from "@aa-sdk/core";
import {
  custom,
  parseEther,
  publicActions,
  zeroAddress,
  getContract,
  hashMessage,
  hashTypedData,
  fromHex,
  isAddress,
  concat,
  testActions,
  type TestActions,
  concatHex,
  type Hex,
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
} from "@account-kit/smart-contracts/experimental";
import {
  createLightAccountClient,
  createModularAccountV2Client,
  type SignerEntity,
} from "@account-kit/smart-contracts";
import { local070Instance } from "~test/instances.js";
import { setBalance } from "viem/actions";
import { accounts } from "~test/constants.js";
import { paymaster070 } from "~test/paymaster/paymaster070.js";
import {
  packAccountGasLimits,
  packPaymasterData,
} from "../../../../../aa-sdk/core/src/entrypoint/0.7.js";
import { entryPoint07Abi } from "viem/account-abstraction";
import {
  alchemy,
  arbitrumSepolia,
  alchemyGasAndPaymasterAndDataMiddleware,
} from "@account-kit/infra";
import { getMAV2UpgradeToData } from "@account-kit/smart-contracts";
import { deferralActions } from "../actions/DeferralActions.js";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

// Note: These tests maintain a shared state to not break the local-running rundler by desyncing the chain.
describe("MA v2 Tests", async () => {
  const instance = local070Instance;
  const isValidSigSuccess = "0x1626ba7e";

  let client: ReturnType<typeof instance.getClient> &
    ReturnType<typeof publicActions> &
    TestActions;
  beforeAll(async () => {
    client = instance
      .getClient()
      .extend(publicActions)
      .extend(testActions({ mode: "anvil" }));
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

  it("installs a session key via deferred action signed by the owner and has it sign a UO", async () => {
    let provider = (await givenConnectedProvider({ signer }))
      .extend(installValidationActions)
      .extend(deferralActions);

    await setBalance(client, {
      address: provider.getAddress(),
      value: parseEther("2"),
    });

    // Test variables
    const sessionKeyEntityId = 1;
    const isGlobalValidation = true;

    // Encode install data to defer
    let encodedInstallData = await provider.encodeInstallValidation({
      validationConfig: {
        moduleAddress: getDefaultSingleSignerValidationModuleAddress(
          provider.chain
        ),
        entityId: sessionKeyEntityId,
        isGlobal: isGlobalValidation,
        isSignatureValidation: true,
        isUserOpValidation: true,
      },
      selectors: [],
      installData: SingleSignerValidationModule.encodeOnInstallData({
        entityId: sessionKeyEntityId,
        signer: await sessionKey.getAddress(),
      }),
      hooks: [],
    });

    // Build the typed data we need for the deferred action (provider/client only used for account address & entrypoint)
    const { typedData, nonceOverride } =
      await provider.createDeferredActionTypedDataObject({
        callData: encodedInstallData,
        deadline: 0,
        entityId: sessionKeyEntityId,
        isGlobalValidation: isGlobalValidation,
      });

    // Sign the typed data using the owner (fallback) validation, this must be done via the account to skip 6492
    const deferredValidationSig = await provider.account.signTypedData(
      typedData
    );

    // Build the full hex to prepend to the UO signature
    // This MUST be done with the *same* client that has signed the typed data
    const signaturePrepend = provider.buildDeferredActionDigest({
      typedData: typedData,
      sig: deferredValidationSig,
    });

    // Build the full UO with the deferred action signature prepend (provider/client only used for account address & entrypoint)
    const unsignedUo = await provider.buildUserOperationWithDeferredAction({
      uo: { target, data: "0x" },
      signaturePrepend,
      nonceOverride,
    });

    // Initialize the session key client corresponding to the session key we will install in the deferred action
    let sessionKeyClient = await createModularAccountV2Client({
      chain: instance.chain,
      signer: sessionKey,
      transport: custom(instance.getClient()),
      accountAddress: provider.getAddress(),
      signerEntity: {
        entityId: sessionKeyEntityId,
        isGlobalValidation: isGlobalValidation,
      },
    });

    // Sign the UO with the session key
    const uo = await sessionKeyClient.signUserOperation({
      uoStruct: unsignedUo,
    });

    // Prepend the full hex for the deferred action to the new, real signature
    uo.signature = concatHex([signaturePrepend, uo.signature as Hex]);

    // Send the raw UserOp
    const result = await sessionKeyClient.sendRawUserOperation(
      uo,
      provider.account.getEntryPoint().address
    );

    await provider.waitForUserOperationTransaction({ hash: result });
  });

  it("installs a session key via deferred action signed by another session key and has it sign a UO", async () => {
    let provider = (await givenConnectedProvider({ signer }))
      .extend(installValidationActions)
      .extend(deferralActions);

    await setBalance(client, {
      address: provider.getAddress(),
      value: parseEther("2"),
    });

    const sessionKeyEntityId = 1;

    // First, install a session key
    let sessionKeyInstallResult = await provider.installValidation({
      validationConfig: {
        moduleAddress: getDefaultSingleSignerValidationModuleAddress(
          provider.chain
        ),
        entityId: sessionKeyEntityId,
        isGlobal: true,
        isSignatureValidation: true,
        isUserOpValidation: true,
      },
      selectors: [],
      installData: SingleSignerValidationModule.encodeOnInstallData({
        entityId: sessionKeyEntityId,
        signer: await sessionKey.getAddress(),
      }),
      hooks: [],
    });

    await provider.waitForUserOperationTransaction(sessionKeyInstallResult);

    // Create a client with the first session key
    let sessionKeyClient = (
      await createModularAccountV2Client({
        chain: instance.chain,
        signer: sessionKey,
        transport: custom(instance.getClient()),
        accountAddress: provider.getAddress(),
        signerEntity: {
          entityId: sessionKeyEntityId,
          isGlobalValidation: true,
        },
      })
    )
      .extend(installValidationActions)
      .extend(deferralActions);

    const randomWallet = privateKeyToAccount(generatePrivateKey());
    const newSessionKey: SmartAccountSigner = new LocalAccountSigner(
      randomWallet
    );

    // Test variables
    const newSessionKeyEntityId = 2;
    const isGlobalValidation = true;

    // Encode install data to defer
    let encodedInstallData = await sessionKeyClient.encodeInstallValidation({
      validationConfig: {
        moduleAddress: getDefaultSingleSignerValidationModuleAddress(
          provider.chain
        ),
        entityId: newSessionKeyEntityId,
        isGlobal: isGlobalValidation,
        isSignatureValidation: true,
        isUserOpValidation: true,
      },
      selectors: [],
      installData: SingleSignerValidationModule.encodeOnInstallData({
        entityId: newSessionKeyEntityId,
        signer: await newSessionKey.getAddress(),
      }),
      hooks: [],
    });

    // Build the typed data we need for the deferred action (provider/client only used for account address & entrypoint)
    const { typedData, nonceOverride } =
      await provider.createDeferredActionTypedDataObject({
        callData: encodedInstallData,
        deadline: 0,
        entityId: newSessionKeyEntityId,
        isGlobalValidation: isGlobalValidation,
      });

    // Sign the typed data using the first session key
    const deferredValidationSig = await sessionKeyClient.account.signTypedData(
      typedData
    );

    // Build the full hex to prepend to the UO signature
    // This MUST be done with the *same* client that has signed the typed data
    const signaturePrepend = sessionKeyClient.buildDeferredActionDigest({
      typedData: typedData,
      sig: deferredValidationSig,
    });

    // Build the full UO with the deferred action signature prepend (provider/client only used for account address & entrypoint)
    const unsignedUo = await provider.buildUserOperationWithDeferredAction({
      uo: { target, data: "0x" },
      signaturePrepend,
      nonceOverride,
    });

    // Initialize the session key client corresponding to the session key we will install in the deferred action
    let newSessionKeyClient = await createModularAccountV2Client({
      chain: instance.chain,
      signer: newSessionKey,
      transport: custom(instance.getClient()),
      accountAddress: provider.getAddress(),
      signerEntity: {
        entityId: newSessionKeyEntityId,
        isGlobalValidation: isGlobalValidation,
      },
    });

    // Sign the UO with the newly installed session key
    const uo = await newSessionKeyClient.signUserOperation({
      uoStruct: unsignedUo,
    });

    // Prepend the full hex for the deferred action to the new, real signature
    uo.signature = concatHex([signaturePrepend, uo.signature as Hex]);

    // Send the raw UserOp (provider/client only used for account address & entrypoint)
    const result = await provider.sendRawUserOperation(
      uo,
      provider.account.getEntryPoint().address
    );

    await provider.waitForUserOperationTransaction({ hash: result });
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
        paymasterMiddleware: "erc7677",
      })
    ).extend(installValidationActions);

    await setBalance(client, {
      address: provider.getAddress(),
      value: parseEther("2"),
    });

    const paymaster = paymaster070.getPaymasterDetails().address;

    const hookInstallData = PaymasterGuardModule.encodeOnInstallData({
      entityId: 1,
      paymaster: paymaster,
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
            entityId: 1,
            hookType: HookType.VALIDATION,
            hasPreHooks: true,
            hasPostHooks: false,
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
        paymasterMiddleware: "erc7677",
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
    const txnHash = sessionKeyProvider.waitForUserOperationTransaction(result);
    await expect(txnHash).resolves.not.toThrowError();

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
        paymasterMiddleware: "erc7677",
      })
    ).extend(installValidationActions);

    await setBalance(client, {
      address: provider.getAddress(),
      value: parseEther("2"),
    });

    const paymaster = paymaster070.getPaymasterDetails().address;

    const hookInstallData = PaymasterGuardModule.encodeOnInstallData({
      entityId: 1,
      paymaster: paymaster,
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
            entityId: 1,
            hookType: HookType.VALIDATION,
            hasPreHooks: true,
            hasPostHooks: false,
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
      moduleAddress: getDefaultSingleSignerValidationModuleAddress(
        provider.chain
      ),
      entityId: 1,
      uninstallData: SingleSignerValidationModule.encodeOnUninstallData({
        entityId: 1,
      }),
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
      installData: "0x",
      hooks: [
        {
          hookConfig: {
            address: getDefaultAllowlistModuleAddress(provider.chain),
            entityId: 1,
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
      uninstallData: SingleSignerValidationModule.encodeOnUninstallData({
        entityId: 1,
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

    // Sending over the limit should currently pass
    const preHookInstallationSendResult = await provider.sendUserOperation({
      uo: {
        target: target,
        value: parseEther("0.6"),
        data: "0x",
      },
    });
    await provider.waitForUserOperationTransaction(
      preHookInstallationSendResult
    );

    // Let's verify the module's limit is set correctly after installation
    const hookInstallData = NativeTokenLimitModule.encodeOnInstallData({
      entityId: 1,
      spendLimit,
    });

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
      installData: "0x",
      hooks: [
        {
          hookConfig: {
            address: getDefaultNativeTokenLimitModuleAddress(provider.chain),
            entityId: 1,
            hookType: HookType.VALIDATION,
            hasPreHooks: true,
            hasPostHooks: false,
          },
          initData: hookInstallData,
        },
        {
          hookConfig: {
            address: getDefaultNativeTokenLimitModuleAddress(provider.chain),
            entityId: 1,
            hookType: HookType.EXECUTION,
            hasPreHooks: true,
            hasPostHooks: false,
          },
          initData: "0x",
        },
      ],
    });

    await provider.waitForUserOperationTransaction(installHookResult);

    // Try to send less than the limit - should pass
    const passingSendResult = await sessionKeyProvider.sendUserOperation({
      uo: {
        target: target,
        value: parseEther("0.05"), // below the 0.5 limit
        data: "0x",
      },
    });
    await provider.waitForUserOperationTransaction(passingSendResult);

    // Try to send more than the limit - should fail
    await expect(
      sessionKeyProvider.sendUserOperation({
        uo: {
          target: target,
          value: parseEther("0.6"), // passing the 0.5 limit
          data: "0x",
        },
      })
    ).rejects.toThrowError();

    const hookUninstallData = NativeTokenLimitModule.encodeOnUninstallData({
      entityId: 1,
    });

    const uninstallResult = await provider.uninstallValidation({
      moduleAddress: getDefaultSingleSignerValidationModuleAddress(
        provider.chain
      ),
      entityId: 1,
      uninstallData: SingleSignerValidationModule.encodeOnUninstallData({
        entityId: 1,
      }),
      hookUninstallDatas: [hookUninstallData, "0x"],
    });

    await provider.waitForUserOperationTransaction(uninstallResult);
  });

  it("installs time range module, sends transaction within valid time range", async () => {
    let provider = (
      await givenConnectedProvider({
        signer,
      })
    ).extend(installValidationActions);

    await setBalance(client, {
      address: provider.getAddress(),
      value: parseEther("2"),
    });

    // create session key client
    const sessionKeyProvider = (
      await givenConnectedProvider({
        signer: sessionKey,
        accountAddress: provider.account.address,
        signerEntity: { entityId: 1, isGlobalValidation: true },
      })
    ).extend(installValidationActions);

    const hookInstallData = TimeRangeModule.encodeOnInstallData({
      entityId: 1,
      validAfter: 1734507101,
      validUntil: 1934507101,
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
            address: getDefaultTimeRangeModuleAddress(provider.chain),
            entityId: 1,
            hookType: HookType.VALIDATION,
            hasPreHooks: true,
            hasPostHooks: false,
          },
          initData: hookInstallData,
        },
      ],
    });

    // verify hook installation succeeded
    await provider.waitForUserOperationTransaction(installResult);

    client.setAutomine(false);

    // force block timestamp to be inside of range
    await client.setNextBlockTimestamp({
      timestamp: 1754507101n,
    });

    await client.mine({
      blocks: 1,
    });

    const uo = await sessionKeyProvider.buildUserOperation({
      uo: {
        target,
        data: "0x",
      },
    });

    const signedUO = (await sessionKeyProvider.signUserOperation({
      uoStruct: uo,
    })) as UserOperationRequest_v7;

    // calls entrypoint directly
    await client.simulateContract({
      address: sessionKeyProvider.account.getEntryPoint().address,
      abi: entryPoint07Abi,
      functionName: "handleOps",
      args: [
        [
          {
            sender: sessionKeyProvider.account.address,
            nonce: fromHex(signedUO.nonce, "bigint"),
            initCode:
              signedUO.factory && signedUO.factoryData
                ? concat([signedUO.factory, signedUO.factoryData])
                : "0x",
            callData: signedUO.callData,
            accountGasLimits: packAccountGasLimits({
              verificationGasLimit: signedUO.verificationGasLimit,
              callGasLimit: signedUO.callGasLimit,
            }),
            preVerificationGas: fromHex(signedUO.preVerificationGas, "bigint"),
            gasFees: packAccountGasLimits({
              maxPriorityFeePerGas: signedUO.maxPriorityFeePerGas,
              maxFeePerGas: signedUO.maxFeePerGas,
            }),
            paymasterAndData:
              signedUO.paymaster && isAddress(signedUO.paymaster)
                ? packPaymasterData({
                    paymaster: signedUO.paymaster,
                    paymasterVerificationGasLimit:
                      signedUO.paymasterVerificationGasLimit,
                    paymasterPostOpGasLimit: signedUO.paymasterPostOpGasLimit,
                    paymasterData: signedUO.paymasterData,
                  })
                : "0x",
            signature: signedUO.signature,
          },
        ],
        provider.account.address,
      ],
      account: await sessionKeyProvider.account.getSigner().getAddress(),
    });

    client.setAutomine(true);
  });

  // NOTE: uses different validation and hook entity id than previous test because we do not uninstall the hook in the previous test
  it("installs time range module, tries to send transaction outside valid time range", async () => {
    let provider = (
      await givenConnectedProvider({
        signer,
      })
    ).extend(installValidationActions);

    await setBalance(client, {
      address: provider.getAddress(),
      value: parseEther("2"),
    });

    // create session key client
    const sessionKeyProvider = (
      await givenConnectedProvider({
        signer: sessionKey,
        accountAddress: provider.account.address,
        signerEntity: { entityId: 2, isGlobalValidation: true },
      })
    ).extend(installValidationActions);

    const hookInstallData = TimeRangeModule.encodeOnInstallData({
      entityId: 2,
      validAfter: 1734507101,
      validUntil: 1934507101,
    });

    const installResult = await provider.installValidation({
      validationConfig: {
        moduleAddress: getDefaultSingleSignerValidationModuleAddress(
          provider.chain
        ),
        entityId: 2,
        isGlobal: true,
        isSignatureValidation: true,
        isUserOpValidation: true,
      },
      selectors: [],
      installData: SingleSignerValidationModule.encodeOnInstallData({
        entityId: 2,
        signer: await sessionKey.getAddress(),
      }),
      hooks: [
        {
          hookConfig: {
            address: getDefaultTimeRangeModuleAddress(provider.chain),
            entityId: 2,
            hookType: HookType.VALIDATION,
            hasPreHooks: true,
            hasPostHooks: false,
          },
          initData: hookInstallData,
        },
      ],
    });

    // verify hook installation succeeded
    await provider.waitForUserOperationTransaction(installResult);

    client.setAutomine(false);

    // force block timestamp to be outside of range
    await client.setNextBlockTimestamp({
      timestamp: 2054507101n,
    });

    await client.mine({
      blocks: 1,
    });

    const uo = await sessionKeyProvider.buildUserOperation({
      uo: {
        target,
        data: "0x",
      },
    });

    const signedUO = (await sessionKeyProvider.signUserOperation({
      uoStruct: uo,
    })) as UserOperationRequest_v7;

    // calls entrypoint directly
    try {
      await client.simulateContract({
        address: sessionKeyProvider.account.getEntryPoint().address,
        abi: entryPoint07Abi,
        functionName: "handleOps",
        args: [
          [
            {
              sender: sessionKeyProvider.account.address,
              nonce: fromHex(signedUO.nonce, "bigint"),
              initCode:
                signedUO.factory && signedUO.factoryData
                  ? concat([signedUO.factory, signedUO.factoryData])
                  : "0x",
              callData: signedUO.callData,
              accountGasLimits: packAccountGasLimits({
                verificationGasLimit: signedUO.verificationGasLimit,
                callGasLimit: signedUO.callGasLimit,
              }),
              preVerificationGas: fromHex(
                signedUO.preVerificationGas,
                "bigint"
              ),
              gasFees: packAccountGasLimits({
                maxPriorityFeePerGas: signedUO.maxPriorityFeePerGas,
                maxFeePerGas: signedUO.maxFeePerGas,
              }),
              paymasterAndData:
                signedUO.paymaster && isAddress(signedUO.paymaster)
                  ? packPaymasterData({
                      paymaster: signedUO.paymaster,
                      paymasterVerificationGasLimit:
                        signedUO.paymasterVerificationGasLimit,
                      paymasterPostOpGasLimit: signedUO.paymasterPostOpGasLimit,
                      paymasterData: signedUO.paymasterData,
                    })
                  : "0x",
              signature: signedUO.signature,
            },
          ],
          provider.account.address,
        ],
        account: await sessionKeyProvider.account.getSigner().getAddress(),
      });
    } catch (err: any) {
      // verify that simulation fails due to violation of time range restriction on session key
      assert(
        err.metaMessages.some((str: string) =>
          str.includes("AA22 expired or not due")
        )
      );
    }

    client.setAutomine(true);
  });

  it("upgrade from a lightaccount", async () => {
    const lightAccountClient = await createLightAccountClient({
      chain: instance.chain,
      signer,
      transport: custom(instance.getClient()),
      version: "v2.0.0",
    });

    await setBalance(client, {
      address: lightAccountClient.getAddress(),
      value: parseEther("2"),
    });

    const { createModularAccountV2FromExisting, ...upgradeToData } =
      await getMAV2UpgradeToData(lightAccountClient, {
        account: lightAccountClient.account,
      });

    await lightAccountClient.upgradeAccount({
      upgradeTo: upgradeToData,
      waitForTx: true,
    });

    const maV2Client = createSmartAccountClient({
      chain: instance.chain,
      transport: custom(client),
      account: await createModularAccountV2FromExisting(),
    });

    // test uo

    const startingAddressBalance = await getTargetBalance();

    const result = await maV2Client.sendUserOperation({
      uo: {
        target: target,
        value: sendAmount,
        data: "0x",
      },
    });

    await maV2Client.waitForUserOperationTransaction(result);

    await expect(getTargetBalance()).resolves.toEqual(
      startingAddressBalance + sendAmount
    );
  });

  const givenConnectedProvider = async ({
    signer,
    signerEntity,
    accountAddress,
    paymasterMiddleware,
  }: {
    signer: SmartAccountSigner;
    signerEntity?: SignerEntity;
    accountAddress?: `0x${string}`;
    paymasterMiddleware?: "alchemyGasAndPaymasterAndData" | "erc7677";
  }) =>
    createModularAccountV2Client({
      chain: instance.chain,
      signer,
      accountAddress,
      signerEntity,
      transport: custom(instance.getClient()),
      ...(paymasterMiddleware === "alchemyGasAndPaymasterAndData"
        ? alchemyGasAndPaymasterAndDataMiddleware({
            policyId: "FAKE_POLICY_ID",
            // @ts-ignore (expects an alchemy transport, but we're using a custom transport for mocking)
            transport: custom(instance.getClient()),
          })
        : paymasterMiddleware === "erc7677"
        ? erc7677Middleware()
        : {}),
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
