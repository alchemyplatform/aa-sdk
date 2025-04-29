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
  prepareEncodeFunctionData,
  isAddress,
  concat,
  testActions,
  concatHex,
  toHex,
  createWalletClient,
  getContractAddress,
  encodeFunctionData,
  type TestActions,
  type ContractFunctionName,
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
  buildFullNonceKey,
  deferralActions,
  PermissionBuilder,
  PermissionType,
  buildDeferredActionDigest,
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
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { mintableERC20Abi, mintableERC20Bytecode } from "../utils.js";
import { type P256Credential } from "viem/account-abstraction";

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
    accounts.fundedAccountOwner,
  );

  const sessionKey: SmartAccountSigner = new LocalAccountSigner(
    accounts.unfundedAccountOwner,
  );

  const webAuthnCredential = {
    id: "m1-bMPuAqpWhCxHZQZTT6e-lSPntQbh3opIoGe7g4Qs",
    publicKey:
      "0x7da44d4bc972affd138c619a211ef0afe0926b813fec67d15587cf8625b2bf185f5044ae96640a63b32aa1eb6f8f993006bbd26292b81cb07a0672302c69a866",
    getFn() {
      return Promise.resolve({
        response: {
          authenticatorData: [
            73, 150, 13, 229, 136, 14, 140, 104, 116, 52, 23, 15, 100, 118, 96,
            91, 143, 228, 174, 185, 162, 134, 50, 199, 153, 92, 243, 186, 131,
            29, 151, 99, 5, 0, 0, 0, 0,
          ],
          clientDataJSON: [
            123, 34, 116, 121, 112, 101, 34, 58, 34, 119, 101, 98, 97, 117, 116,
            104, 110, 46, 103, 101, 116, 34, 44, 34, 99, 104, 97, 108, 108, 101,
            110, 103, 101, 34, 58, 34, 49, 80, 49, 79, 71, 74, 69, 121, 74, 122,
            65, 50, 82, 74, 95, 74, 52, 82, 71, 89, 120, 122, 107, 87, 71, 48,
            119, 66, 70, 113, 109, 105, 51, 77, 51, 54, 72, 69, 107, 103, 66,
            118, 69, 34, 44, 34, 111, 114, 105, 103, 105, 110, 34, 58, 34, 104,
            116, 116, 112, 58, 47, 47, 108, 111, 99, 97, 108, 104, 111, 115,
            116, 58, 53, 49, 55, 51, 34, 44, 34, 99, 114, 111, 115, 115, 79,
            114, 105, 103, 105, 110, 34, 58, 102, 97, 108, 115, 101, 125,
          ],
          signature: [
            48, 69, 2, 33, 0, 198, 106, 113, 129, 35, 170, 51, 12, 13, 0, 67,
            158, 211, 55, 188, 103, 33, 194, 2, 152, 190, 159, 181, 11, 176,
            232, 114, 59, 99, 64, 167, 220, 2, 32, 101, 188, 55, 216, 145, 203,
            39, 137, 83, 114, 45, 10, 147, 246, 218, 247, 132, 221, 228, 225,
            57, 110, 143, 87, 172, 198, 76, 141, 30, 169, 166, 2,
          ],
        },
      } as any);
    },
    rpId: "",
  } as const;

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
      startingAddressBalance + sendAmount,
    );
  });

  it("successfully sign + validate a message, for WebAuthn account", async () => {
    const provider = await givenConnectedProvider({
      webAuthnAccountParams,
    });

    await setBalance(instance.getClient(), {
      address: provider.getAddress(),
      value: parseEther("2"),
    });

    const accountContract = getContract({
      address: provider.getAddress(),
      abi: semiModularAccountBytecodeAbi,
      client,
    });

    const message = "testmessage";

    let signature = await provider.signMessage({ message });

    await expect(
      accountContract.read.isValidSignature([hashMessage(message), signature])
    ).resolves.toEqual(isValidSigSuccess);
  });

  it("successfully sign + validate a message, for native and single signer validation", async () => {
    const provider = (await givenConnectedProvider({ signer })).extend(
      installValidationActions,
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
          provider.chain,
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
      accountContract.read.isValidSignature([hashMessage(message), signature]),
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
      accountContract.read.isValidSignature([hashMessage(message), signature]),
    ).resolves.toEqual(isValidSigSuccess);
  });

  it("successfully sign + validate typed data messages, for native and single signer validation", async () => {
    const provider = (await givenConnectedProvider({ signer })).extend(
      installValidationActions,
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
          provider.chain,
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
      accountContract.read.isValidSignature([
        hashedMessageTypedData,
        signature,
      ]),
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
      accountContract.read.isValidSignature([
        hashedMessageTypedData,
        signature,
      ]),
    ).resolves.toEqual(isValidSigSuccess);
  });

  it("adds a session key with no permissions", async () => {
    let provider = (await givenConnectedProvider({ signer })).extend(
      installValidationActions,
    );

    await setBalance(client, {
      address: provider.getAddress(),
      value: parseEther("2"),
    });

    let result = await provider.installValidation({
      validationConfig: {
        moduleAddress: getDefaultSingleSignerValidationModuleAddress(
          provider.chain,
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
      startingAddressBalance + sendAmount,
    );
  });

  it("installs a session key via deferred action using PermissionBuilder signed by the owner and has it sign a UO", async () => {
    let provider = (
      await givenConnectedProvider({
        signer,
      })
    )
      .extend(installValidationActions)
      .extend(deferralActions);

    await setBalance(client, {
      address: provider.getAddress(),
      value: parseEther("2"),
    });

    const { entityId, nonce } = await provider.getEntityIdAndNonce({
      isGlobalValidation: false,
    });

    // Must be built with the client that's going to sign the deferred action
    // OR a client with the same set signer entity as the signing client (entityId + isGlobal)
    const { typedData, fullPreSignatureDeferredActionDigest } =
      await new PermissionBuilder({
        client: provider,
        key: {
          publicKey: await sessionKey.getAddress(),
          type: "secp256k1",
        },
        entityId: entityId,
        nonce: nonce,
        deadline: 0,
      })
        .addPermission({
          permission: {
            type: PermissionType.GAS_LIMIT,
            data: {
              limit: toHex(parseEther("1")),
            },
          },
        })
        .addPermission({
          permission: {
            type: PermissionType.CONTRACT_ACCESS,
            data: {
              address: target,
            },
          },
        })
        .compileDeferred();

    // Sign the typed data using the owner (fallback) validation, this must be done via the account to skip 6492
    const deferredValidationSig =
      await provider.account.signTypedData(typedData);

    // Build the full hex to prepend to the UO signature
    const deferredActionDigest = buildDeferredActionDigest({
      fullPreSignatureDeferredActionDigest,
      sig: deferredValidationSig,
    });

    // Initialize the session key client corresponding to the session key we will install in the deferred action
    let sessionKeyClient = await createModularAccountV2Client({
      transport: custom(instance.getClient()),
      chain: instance.chain,
      accountAddress: provider.getAddress(),
      signer: sessionKey,
      initCode: await provider.account.getInitCode(), // must be called with the owner provider!
      deferredAction: deferredActionDigest,
    });

    // Send the raw UserOp
    const result = await sessionKeyClient.sendUserOperation({
      uo: {
        target: target,
        value: sendAmount,
        data: "0x",
      },
    });

    await provider.waitForUserOperationTransaction(result);
  });

  it("installs a session key via deferred action using PermissionBuilder with ERC20 permission signed by the owner and has it sign a UO", async () => {
    let provider = (
      await givenConnectedProvider({
        signer,
      })
    )
      .extend(installValidationActions)
      .extend(deferralActions);

    await setBalance(client, {
      address: provider.getAddress(),
      value: parseEther("2"),
    });

    const walletClient = createWalletClient({
      chain: provider.chain,
      transport: custom(instance.getClient()),
      account: privateKeyToAccount(generatePrivateKey()),
    });

    await setBalance(client, {
      address: walletClient.account.address,
      value: parseEther("2"),
    });

    const mockErc20Address = getContractAddress({
      from: walletClient.account.address,
      nonce: BigInt(
        await client.getTransactionCount({
          address: walletClient.account.address,
        }),
      ),
    });

    // Deploy mock ERC20
    await walletClient.deployContract({
      abi: mintableERC20Abi,
      account: walletClient.account,
      bytecode: mintableERC20Bytecode,
    });

    // Mint some test tokens
    await walletClient.writeContract({
      address: mockErc20Address,
      abi: mintableERC20Abi,
      functionName: "mint",
      args: [provider.getAddress(), 1000n],
    });

    // Test variables
    // const sessionKeyEntityId = 1;
    // these can be default values or from call arguments
    const { entityId, nonce } = await provider.getEntityIdAndNonce({
      isGlobalValidation: false, // assumes the session key is used to sign the UO
    });

    // Must be built with the client that's going to sign the deferred action
    // OR a client with the same set signer entity as the signing client (entityId + isGlobal)
    const { typedData, fullPreSignatureDeferredActionDigest } =
      await new PermissionBuilder({
        client: provider,
        key: {
          publicKey: await sessionKey.getAddress(),
          type: "secp256k1",
        },
        entityId: entityId,
        nonce: nonce,
        deadline: 0,
      })
        .addPermission({
          permission: {
            type: PermissionType.ERC20_TOKEN_TRANSFER,
            data: {
              address: mockErc20Address,
              allowance: toHex(900),
            },
          },
        })
        .compileDeferred();

    // Sign the typed data using the owner (fallback) validation, this must be done via the account to skip 6492
    const deferredValidationSig =
      await provider.account.signTypedData(typedData);

    // Build the full hex to prepend to the UO signature
    const deferredActionDigest = buildDeferredActionDigest({
      fullPreSignatureDeferredActionDigest,
      sig: deferredValidationSig,
    });

    // Initialize the session key client corresponding to the session key we will install in the deferred action
    let sessionKeyClient = await createModularAccountV2Client({
      chain: instance.chain,
      signer: sessionKey,
      transport: custom(instance.getClient()),
      accountAddress: provider.getAddress(),
      initCode: await provider.account.getInitCode(),
      deferredAction: deferredActionDigest,
    });

    // Validate the target's balance is zero before the transfer
    expect(
      await client.readContract({
        address: mockErc20Address,
        abi: mintableERC20Abi,
        functionName: "balanceOf",
        args: [target],
      }),
    ).to.eq(0n);

    // Build the full UO with the deferred action signature prepend (must be session key client)
    const hash = await sessionKeyClient.sendUserOperation({
      uo: {
        target: mockErc20Address,
        data: encodeFunctionData({
          abi: mintableERC20Abi,
          functionName: "transfer",
          args: [target, 900n],
        }),
      },
    });

    await provider.waitForUserOperationTransaction({ hash: hash.hash });

    // Validate the erc20 transfer happened
    expect(
      await client.readContract({
        address: mockErc20Address,
        abi: mintableERC20Abi,
        functionName: "balanceOf",
        args: [target],
      }),
    ).to.eq(900n);
  });

  it("Low-level installs a session key via deferred action signed by the owner and has it sign a UO", async () => {
    let provider = (await givenConnectedProvider({ signer }))
      .extend(installValidationActions)
      .extend(deferralActions);

    await setBalance(client, {
      address: provider.getAddress(),
      value: parseEther("2"),
    });

    // Test variables
    const isGlobalValidation = true;
    const { entityId, nonce } = await provider.getEntityIdAndNonce({
      isGlobalValidation: isGlobalValidation,
    });

    // Encode install data to defer
    let encodedInstallData = await provider.encodeInstallValidation({
      validationConfig: {
        moduleAddress: getDefaultSingleSignerValidationModuleAddress(
          provider.chain,
        ),
        entityId: entityId,
        isGlobal: isGlobalValidation,
        isSignatureValidation: true,
        isUserOpValidation: true,
      },
      selectors: [],
      installData: SingleSignerValidationModule.encodeOnInstallData({
        entityId: entityId,
        signer: await sessionKey.getAddress(),
      }),
      hooks: [],
    });

    // Build the typed data we need for the deferred action (provider/client only used for account address & entrypoint)
    const { typedData } = await provider.createDeferredActionTypedDataObject({
      callData: encodedInstallData,
      deadline: 0,
      nonce,
    });

    // Sign the typed data using the owner (fallback) validation, this must be done via the account to skip 6492
    const deferredValidationSig =
      await provider.account.signTypedData(typedData);

    const fullPreSignatureDeferredActionDigest =
      provider.buildPreSignatureDeferredActionDigest({
        typedData,
      });

    // Build the full hex to prepend to the UO signature
    const deferredActionDigest = buildDeferredActionDigest({
      fullPreSignatureDeferredActionDigest,
      sig: deferredValidationSig,
    });

    // preExecHooks 00, nonce, deferredActionDigest
    const fullDeferredAction = concatHex([
      "0x00",
      toHex(nonce, { size: 32 }),
      deferredActionDigest,
    ]);

    // Initialize the session key client corresponding to the session key we will install in the deferred action
    let sessionKeyClient = await createModularAccountV2Client({
      transport: custom(instance.getClient()),
      chain: instance.chain,
      accountAddress: provider.getAddress(),
      signer: sessionKey,
      initCode: await provider.account.getInitCode(),
      deferredAction: fullDeferredAction,
    });

    // Build the full UO with the deferred action signature prepend (provider/client only used for account address & entrypoint)
    const unsignedUo = await sessionKeyClient.buildUserOperation({
      uo: { target, data: "0x" },
      overrides: {
        nonce: nonce,
      },
    });

    // Sign the UO with the session key
    const uo = await sessionKeyClient.signUserOperation({
      uoStruct: unsignedUo,
    });

    // Send the raw UserOp
    const result = await sessionKeyClient.sendRawUserOperation(
      uo,
      provider.account.getEntryPoint().address,
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
          provider.chain,
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
      randomWallet,
    );

    const { entityId, nonce } = await provider.getEntityIdAndNonce({
      isGlobalValidation: true,
    });

    // Must be built with the client that's going to sign the deferred action
    // OR a client with the same set signer entity as the signing client (entityId + isGlobal)
    const { typedData, fullPreSignatureDeferredActionDigest } =
      await new PermissionBuilder({
        client: sessionKeyClient,
        key: {
          publicKey: await newSessionKey.getAddress(),
          type: "secp256k1",
        },
        entityId: entityId,
        nonce: nonce,
        deadline: 0,
      })
        .addPermission({
          permission: {
            type: PermissionType.ROOT,
          },
        })
        .compileDeferred();

    // Sign the typed data using the first session key
    const deferredValidationSig =
      await sessionKeyClient.account.signTypedData(typedData);

    // Build the full hex to prepend to the UO signature
    const deferredActionDigest = buildDeferredActionDigest({
      fullPreSignatureDeferredActionDigest,
      sig: deferredValidationSig,
    });

    // Initialize the session key client corresponding to the session key we will install in the deferred action
    let newSessionKeyClient = await createModularAccountV2Client({
      transport: custom(instance.getClient()),
      chain: instance.chain,
      accountAddress: provider.getAddress(),
      signer: newSessionKey,
      initCode: await provider.account.getInitCode(),
      deferredAction: deferredActionDigest,
    });

    // Send the UserOp (provider/client only used for account address & entrypoint)
    const result = await newSessionKeyClient.sendUserOperation({
      uo: {
        target,
        data: "0x",
      },
    });

    await provider.waitForUserOperationTransaction(result);
  });

  it("uninstalls a session key", async () => {
    let provider = (await givenConnectedProvider({ signer })).extend(
      installValidationActions,
    );

    await setBalance(client, {
      address: provider.getAddress(),
      value: parseEther("2"),
    });

    let result = await provider.installValidation({
      validationConfig: {
        moduleAddress: getDefaultSingleSignerValidationModuleAddress(
          provider.chain,
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
        provider.chain,
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
      }),
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
          provider.chain,
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

    // verify hook installation succeeded
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
      provider.waitForUserOperationTransaction(uninstallResult),
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
          provider.chain,
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
      }),
    ).rejects.toThrowError();

    const hookUninstallData = PaymasterGuardModule.encodeOnUninstallData({
      entityId: 1,
    });

    const uninstallResult = await provider.uninstallValidation({
      moduleAddress: getDefaultSingleSignerValidationModuleAddress(
        provider.chain,
      ),
      entityId: 1,
      uninstallData: SingleSignerValidationModule.encodeOnUninstallData({
        entityId: 1,
      }),
      hookUninstallDatas: [hookUninstallData],
    });

    // verify uninstall
    await expect(
      provider.waitForUserOperationTransaction(uninstallResult),
    ).resolves.not.toThrowError();
  });

  it("installs allowlist module, uses, then uninstalls", async () => {
    let provider = (await givenConnectedProvider({ signer })).extend(
      installValidationActions,
    );

    await setBalance(client, {
      address: provider.getAddress(),
      value: parseEther("2"),
    });

    // install validation module
    const installResult = await provider.installValidation({
      validationConfig: {
        moduleAddress: getDefaultSingleSignerValidationModuleAddress(
          provider.chain,
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
      sendResultBeforeHookInstallation,
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
          provider.chain,
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
      }),
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
        provider.chain,
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
      installValidationActions,
    );

    await setBalance(client, {
      address: provider.getAddress(),
      value: parseEther("2"),
    });

    const spendLimit = parseEther("0.5");

    const installResult = await provider.installValidation({
      validationConfig: {
        moduleAddress: getDefaultSingleSignerValidationModuleAddress(
          provider.chain,
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
      preHookInstallationSendResult,
    );

    // Let's verify the module's limit is set correctly after installation
    const hookInstallData = NativeTokenLimitModule.encodeOnInstallData({
      entityId: 1,
      spendLimit,
    });

    const installHookResult = await provider.installValidation({
      validationConfig: {
        moduleAddress: getDefaultSingleSignerValidationModuleAddress(
          provider.chain,
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
      }),
    ).rejects.toThrowError();

    const hookUninstallData = NativeTokenLimitModule.encodeOnUninstallData({
      entityId: 1,
    });

    const uninstallResult = await provider.uninstallValidation({
      moduleAddress: getDefaultSingleSignerValidationModuleAddress(
        provider.chain,
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
          provider.chain,
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
          provider.chain,
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
                "bigint",
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
          str.includes("AA22 expired or not due"),
        ),
      );
    }

    client.setAutomine(true);
  });

  it("tests entity id and nonce selection", async () => {
    let newClient = (await givenConnectedProvider({ signer }))
      .extend(deferralActions)
      .extend(installValidationActions);

    await setBalance(client, {
      address: newClient.getAddress(),
      value: parseEther("2"),
    });

    const entryPoint = newClient.account.getEntryPoint();
    const entryPointContract = getContract({
      address: entryPoint.address,
      abi: entryPoint.abi,
      client,
    });

    // entity id and nonce selection for undeployed account
    for (let startEntityId = 0; startEntityId < 5; startEntityId++) {
      for (let startNonce = 0n; startNonce < 5n; startNonce++) {
        const { entityId, nonce } = await newClient.getEntityIdAndNonce({
          entityId: startEntityId,
          nonceKey: startNonce,
          isGlobalValidation: true,
        });

        const expectedEntityId: number = Math.max(1, startEntityId);

        // account not deployed, expect to get 1 when we pass in 0
        expect(entityId).toEqual(expectedEntityId);
        await expect(
          entryPointContract.read.getNonce([
            newClient.account.address,
            buildFullNonceKey({
              nonceKey: startNonce,
              entityId: expectedEntityId,
              isDeferredAction: true,
            }),
          ]),
        ).resolves.toEqual(nonce);
      }
    }

    // deploy the account and install at entity id 1 with global validation
    const uo1 = await newClient.installValidation({
      validationConfig: {
        moduleAddress: getDefaultSingleSignerValidationModuleAddress(
          newClient.chain,
        ),
        entityId: 1,
        isGlobal: true,
        isSignatureValidation: false,
        isUserOpValidation: false,
      },
      selectors: [],
      installData: SingleSignerValidationModule.encodeOnInstallData({
        entityId: 1,
        signer: await sessionKey.getAddress(),
      }),
      hooks: [],
    });
    await newClient.waitForUserOperationTransaction(uo1);

    const fns: ContractFunctionName<typeof semiModularAccountBytecodeAbi>[] = [
      "execute",
      "executeBatch",
    ];

    const selectors = fns.map(
      (s) =>
        prepareEncodeFunctionData({
          abi: semiModularAccountBytecodeAbi,
          functionName: s,
        }).functionName,
    );

    // deploy the account and install some entity ids with selector validation
    const uo2 = await newClient.installValidation({
      validationConfig: {
        moduleAddress: getDefaultSingleSignerValidationModuleAddress(
          newClient.chain,
        ),
        entityId: 2,
        isGlobal: false,
        isSignatureValidation: false,
        isUserOpValidation: false,
      },
      selectors,
      installData: SingleSignerValidationModule.encodeOnInstallData({
        entityId: 2,
        signer: await sessionKey.getAddress(),
      }),
      hooks: [],
    });
    await newClient.waitForUserOperationTransaction(uo2);

    // entity id and nonce selection for undeployed account
    for (let startEntityId = 1; startEntityId < 5; startEntityId++) {
      for (let startNonce = 0n; startNonce < 5n; startNonce++) {
        const { entityId, nonce } = await newClient.getEntityIdAndNonce({
          entityId: startEntityId,
          nonceKey: startNonce,
          isGlobalValidation: true,
        });

        const expectedEntityId: number = Math.max(startEntityId, 3);

        // expect to get max(3, startEntityId)
        expect(entityId).toEqual(expectedEntityId);
        await expect(
          entryPointContract.read.getNonce([
            newClient.account.address,
            buildFullNonceKey({
              nonceKey: startNonce,
              entityId: expectedEntityId,
              isDeferredAction: true,
            }),
          ]),
        ).resolves.toEqual(nonce);
      }
    }
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
      startingAddressBalance + sendAmount,
    );
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
      }),
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
      }),
    ).toMatch("faked");

    expect(alchemyClientSpy).not.toHaveBeenCalled();
    expect(notAlchemyClientSpy).toHaveBeenCalled();
  });

  let salt = 1n;

  const givenConnectedProvider = async ({
    signer,
    signerEntity,
    accountAddress,
    paymasterMiddleware,
    webAuthnAccountParams = null,
  }: {
    signer: SmartAccountSigner;
    signerEntity?: SignerEntity;
    accountAddress?: `0x${string}`;
    paymasterMiddleware?: "alchemyGasAndPaymasterAndData" | "erc7677";
    credential?: P256Credential & {
      getFn?: (options: CredentialRequestOptions) => Promise<Credential | null>;
      rpId: string;
    };
  }) =>
    createModularAccountV2Client({
      chain: instance.chain,
      signer,
      credential: webAuthnAccountParams,
      mode: webAuthnAccountParams ? "webauthn" : "default",
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
      salt: salt++,
    });
});
