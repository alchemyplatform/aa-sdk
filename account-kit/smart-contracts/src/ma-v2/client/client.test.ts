import * as AACoreModule from "@aa-sdk/core";
import {
  createSmartAccountClient,
  deepHexlify,
  erc7677Middleware,
  InvalidUserOperationError,
  isValidRequest,
  LocalAccountSigner,
  type SmartAccountSigner,
  type UserOperationRequest_v7,
} from "@aa-sdk/core";
import * as AAInfraModule from "@account-kit/infra";
import {
  alchemy,
  alchemyGasAndPaymasterAndDataMiddleware,
  arbitrumSepolia,
} from "@account-kit/infra";
import {
  createLightAccountClient,
  getMAV2UpgradeToData,
  type SignerEntity,
} from "@account-kit/smart-contracts";
import {
  AllowlistModule,
  buildDeferredActionDigest,
  buildFullNonceKey,
  deferralActions,
  getDefaultAllowlistModuleAddress,
  getDefaultNativeTokenLimitModuleAddress,
  getDefaultPaymasterGuardModuleAddress,
  getDefaultSingleSignerValidationModuleAddress,
  getDefaultTimeRangeModuleAddress,
  getDefaultWebauthnValidationModuleAddress,
  installValidationActions,
  NativeTokenLimitModule,
  PaymasterGuardModule,
  PermissionBuilder,
  PermissionType,
  semiModularAccountBytecodeAbi,
  SingleSignerValidationModule,
  TimeRangeModule,
} from "@account-kit/smart-contracts/experimental";
import {
  concat,
  concatHex,
  createWalletClient,
  custom,
  encodeFunctionData,
  fromHex,
  getContract,
  getContractAddress,
  hashMessage,
  hashTypedData,
  isAddress,
  parseEther,
  prepareEncodeFunctionData,
  publicActions,
  testActions,
  toHex,
  zeroAddress,
  keccak256,
  encodePacked,
  type ContractFunctionName,
  type TestActions,
  encodeAbiParameters,
  stringToBytes,
} from "viem";
import {
  createWebAuthnCredential,
  entryPoint07Abi,
  type ToWebAuthnAccountParameters,
} from "viem/account-abstraction";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { setBalance } from "viem/actions";
import { accounts } from "~test/constants.js";
import { local070Instance } from "~test/instances.js";
import { paymaster070 } from "~test/paymaster/paymaster070.js";
import { SoftWebauthnDevice } from "~test/webauthn.js";
import {
  packAccountGasLimits,
  packPaymasterData,
} from "../../../../../aa-sdk/core/src/entrypoint/0.7.js";
import { HookType } from "../actions/common/types.js";
import { mintableERC20Abi, mintableERC20Bytecode } from "../utils.js";
import { createModularAccountV2Client } from "./client.js";

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

  const webauthnDevice = new SoftWebauthnDevice();

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

  beforeEach(async () => {
    sessionKey = LocalAccountSigner.generatePrivateKeySigner();
    signer = LocalAccountSigner.generatePrivateKeySigner();
  });

  it("sends a simple UO", async () => {
    const provider = await givenConnectedProvider({ signer });

    await setBalance(instance.getClient(), {
      address: provider.getAddress(),
      value: parseEther("20"),
    });

    const startingAddressBalance = await getTargetBalance();

    const result = await provider.sendUserOperation({
      uo: {
        target: target,
        value: sendAmount,
        data: "0x",
      },
    });

    await provider.waitForUserOperationTransaction(result).catch(async () => {
      const dropAndReplaceResult = await provider.dropAndReplaceUserOperation({
        uoToDrop: result.request,
      });
      await provider.waitForUserOperationTransaction(dropAndReplaceResult);
    });

    await expect(getTargetBalance()).resolves.toEqual(
      startingAddressBalance + sendAmount
    );
  });

  it("sends a simple UO with webauthn account", async () => {
    const provider = await givenWebAuthnProvider();

    await setBalance(instance.getClient(), {
      address: provider.getAddress(),
      value: parseEther("2"),
    });

    // send UO with webauthn gas estimator
    const builtUO = await provider.buildUserOperation({
      uo: {
        target: target,
        value: sendAmount,
        data: "0x",
      },
    });

    const request = deepHexlify(builtUO);
    if (!isValidRequest(request)) {
      throw new InvalidUserOperationError(builtUO);
    }

    const uoHash = provider.account
      .getEntryPoint()
      .getUserOperationHash(request);

    console.log("uoHash", uoHash);

    let signedUOHash = await provider.account.signUserOperationHash(uoHash);

    const signedUO = await provider.signUserOperation({ uoStruct: builtUO });

    signedUO.signature = signedUOHash;

    await provider.sendRawUserOperation(
      signedUO,
      provider.account.getEntryPoint().address
    );
  });

  it.fails(
    "successfully sign + validate a message, for WebAuthn account",
    async () => {
      const provider = await givenWebAuthnProvider();

      await setBalance(instance.getClient(), {
        address: provider.getAddress(),
        value: parseEther("2"),
      });

      const message = "0xdeadbeef";

      let signature = await provider.signMessage({ message });

      const publicClient = instance.getClient().extend(publicActions);

      const domain = {
        name: keccak256(stringToBytes("MyDapp")),
        version: keccak256(stringToBytes("1")),
        chainId: provider.chain.id,
        verifyingContract: getDefaultWebauthnValidationModuleAddress(
          provider.chain
        ),
      };

      const typeHash = keccak256(
        //ethers.utils.toUtf8Bytes
        stringToBytes(
          "EIP712Domain(string name,string version,number chainId,address verifyingContract)"
        )
      );

      // TODO: consolidate formatting message to EIP-712 format (https://github.dev/fractional-company/contracts/blob/master/src/OpenZeppelin/drafts/EIP712.sol) with 1271 validation as part of the format + prepare signature work
      const messageEIP712 = keccak256(
        encodePacked(
          ["bytes32", "bytes32", "bytes32"],
          [
            keccak256(stringToBytes("\x19\x01")),
            keccak256(
              encodeAbiParameters(
                [
                  { name: "typeHash", type: "bytes32" },
                  { name: "name", type: "bytes32" },
                  { name: "version", type: "bytes32" },
                  { name: "chainId", type: "uint256" },
                  { name: "verifyingContract", type: "address" },
                ],
                [
                  typeHash,
                  domain.name,
                  domain.version,
                  BigInt(domain.chainId),
                  domain.verifyingContract,
                ]
              )
            ),
            keccak256(stringToBytes(message)),
          ]
        )
      );

      const isValid = await publicClient.verifyMessage({
        // TODO: this is gonna fail until the message can be formatted since the actual message is EIP-712
        message,
        address: provider.getAddress(),
        signature,
      });

      expect(isValid).toBe(true);
    }
  );

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
        })
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
      })
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
      })
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
          provider.chain
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

  it.fails(
    "installs paymaster guard module, verifies use of valid paymaster, then uninstalls module",
    async () => {
      let provider = (
        await givenConnectedProvider({
          signer,
          paymasterMiddleware: "erc7677",
        })
      ).extend(installValidationActions);

      await setBalance(client, {
        address: provider.getAddress(),
        value: parseEther("20"),
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
      const result = await sessionKeyProvider
        .sendUserOperation({
          uo: {
            target: zeroAddress,
            value: 0n,
            data: "0x",
          },
        })
        .catch((e) => {
          console.log("FAILED HERE 1");
          console.log(e);
          throw e;
        });

      // verify if correct paymaster is used
      const txnHash =
        sessionKeyProvider.waitForUserOperationTransaction(result);
      await expect(txnHash).resolves.not.toThrowError();

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
    }
  );

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
          ])
        ).resolves.toEqual(nonce);
      }
    }

    // deploy the account and install at entity id 1 with global validation
    const uo1 = await newClient.installValidation({
      validationConfig: {
        moduleAddress: getDefaultSingleSignerValidationModuleAddress(
          newClient.chain
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
        }).functionName
    );

    // deploy the account and install some entity ids with selector validation
    const uo2 = await newClient.installValidation({
      validationConfig: {
        moduleAddress: getDefaultSingleSignerValidationModuleAddress(
          newClient.chain
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
          ])
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
      startingAddressBalance + sendAmount
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

  let salt = 1n;

  const givenConnectedProviderNoSigner = async ({
    signerEntity,
    accountAddress,
    paymasterMiddleware,
    credential,
    getFn,
    rpId,
  }: {
    signerEntity?: SignerEntity;
    accountAddress?: `0x${string}`;
    paymasterMiddleware?: "alchemyGasAndPaymasterAndData" | "erc7677";
    credential: ToWebAuthnAccountParameters["credential"];
    getFn?: ToWebAuthnAccountParameters["getFn"];
    rpId?: ToWebAuthnAccountParameters["rpId"];
  }) =>
    createModularAccountV2Client({
      chain: instance.chain,
      accountAddress,
      signerEntity,
      credential,
      getFn,
      rpId,
      mode: "webauthn",
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

  const givenWebAuthnProvider = async () => {
    const credential = await createWebAuthnCredential({
      rp: { id: "localhost", name: "localhost" },
      createFn: (opts) => webauthnDevice.create(opts, "localhost"),
      user: { name: "test", displayName: "test" },
    });

    const provider = await givenConnectedProviderNoSigner({
      credential,
      getFn: (opts) => webauthnDevice.get(opts, "localhost"),
      rpId: "localhost",
    });

    return provider;
  };

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
      feeEstimator: alchemyFeeEstimator(
        // @ts-ignore (expects an alchemy transport, but we're using a custom transport for mocking)
        custom(instance.getClient())
      ),
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
