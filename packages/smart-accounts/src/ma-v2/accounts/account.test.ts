import {
  createWalletClient,
  custom,
  parseEther,
  publicActions,
  testActions,
  type Address,
  type Hex,
  type LocalAccount,
  concat,
  concatHex,
  encodeFunctionData,
  getContract,
  getContractAddress,
  hashMessage,
  hashTypedData,
  isAddress,
  prepareEncodeFunctionData,
  toHex,
  zeroAddress,
  type ContractFunctionName,
  type TestActions,
  parseAbi,
  createPublicClient,
  isHex,
} from "viem";
import {
  createBundlerClient,
  entryPoint07Abi,
  createWebAuthnCredential,
  toWebAuthnAccount,
  type WebAuthnAccount,
} from "viem/account-abstraction";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { getBlock, setBalance } from "viem/actions";
import { parsePublicKey } from "webauthn-p256";
import { local070Instance } from "~test/instances.js";
import { paymaster070 } from "~test/paymaster/paymaster070.js";
import { SoftWebauthnDevice } from "~test/webauthn.js";
import { WebAuthnValidationModule } from "../modules/webauthn-validation/module.js";
import { toModularAccountV2 } from "./account.js";
import { toLightAccount } from "../../light-account/accounts/account.js";
import { deferralActions } from "../decorators/deferralActions.js";
import { installValidationActions } from "../decorators/installValidation.js";
import { HookType, SignaturePrefix } from "../types.js";
import { buildFullNonceKey, DefaultModuleAddress } from "../utils/account.js";
import { semiModularAccountBytecodeAbi } from "../abis/semiModularAccountBytecodeAbi.js";
import { SingleSignerValidationModule } from "../modules/single-signer-validation/module.js";
import { PermissionBuilder, PermissionType } from "../permissionBuilder.js";
import { buildDeferredActionDigest } from "../utils/deferredActions.js";
import { PaymasterGuardModule } from "../modules/paymaster-guard-module/module.js";
import { AllowlistModule } from "../modules/allowlist-module/module.js";
import { NativeTokenLimitModule } from "../modules/native-token-limit-module/module.js";
import { TimeRangeModule } from "../modules/time-range-module/module.js";
import { raise } from "@alchemy/common";
import { getMAV2UpgradeToData } from "../utils/account.js";
import {
  bigIntMultiply,
  packAccountGasLimits,
  packPaymasterData,
} from "../../utils.js";

// Note: These tests maintain a shared state to not break the local-running rundler by desyncing the chain.
describe("MA v2 Account Tests", async () => {
  const instance = local070Instance;
  const VALID_1271_SIG_MAGIC_BYTES = "0x1626ba7e";

  let client: ReturnType<typeof instance.getClient> &
    ReturnType<typeof publicActions> &
    TestActions;

  beforeAll(async () => {
    client = instance
      .getClient()
      .extend(publicActions)
      .extend(testActions({ mode: "anvil" }));
  });

  let owner: LocalAccount;
  let sessionKey: LocalAccount;

  const target = "0x000000000000000000000000000000000000dEaD";
  const sendAmount = parseEther("1");

  const getTargetBalance = async (): Promise<bigint> =>
    client.getBalance({
      address: target,
    });

  beforeEach(async () => {
    owner = privateKeyToAccount(generatePrivateKey());
    sessionKey = privateKeyToAccount(generatePrivateKey());
  });

  it("sends a simple UO", { retry: 3, timeout: 30_000 }, async () => {
    const provider = await givenConnectedProvider({ signer: owner });

    await setBalance(instance.getClient(), {
      address: provider.account.address,
      value: parseEther("20"),
    });

    const startingAddressBalance = await getTargetBalance();

    const hash = await provider.sendUserOperation({
      calls: [
        {
          to: target,
          value: sendAmount,
          data: "0x",
        },
      ],
    });

    await provider.waitForUserOperationReceipt({
      hash,
      timeout: 30_000,
    });

    await expect(getTargetBalance()).resolves.toEqual(
      startingAddressBalance + sendAmount
    );
  });

  it(
    "sends a simple UO with webauthn account",
    { retry: 3, timeout: 30_000 },
    async () => {
      const credential = await givenWebauthnCredential();

      const provider = await givenConnectedProvider({
        signer: toWebAuthnAccount(credential),
      });

      await setBalance(instance.getClient(), {
        address: provider.account.address,
        value: parseEther("2"),
      });

      const hash = await provider.sendUserOperation({
        calls: [
          {
            to: target,
            value: sendAmount,
            data: "0x",
          },
        ],
      });

      const startingAddressBalance = await getTargetBalance();

      await provider.waitForUserOperationReceipt({ hash, timeout: 30_000 });

      await expect(getTargetBalance()).resolves.toEqual(
        startingAddressBalance + sendAmount
      );
    }
  );

  it("installs WebAuthnValidationModule, sends UO on behalf of owner with webauthn session key", async () => {
    const credential = await givenWebauthnCredential();

    const provider = await givenConnectedProvider({
      signer: toWebAuthnAccount(credential),
    });

    await setBalance(instance.getClient(), {
      address: provider.account.address,
      value: parseEther("2"),
    });

    const sessionKeyCredential = await givenWebauthnCredential();
    const { x, y } = parsePublicKey(sessionKeyCredential.credential.publicKey);

    // install webauthn validation module
    const hash = await provider
      .extend(installValidationActions)
      .installValidation({
        validationConfig: {
          moduleAddress: DefaultModuleAddress.WEBAUTHN_VALIDATION,
          entityId: 1,
          isGlobal: true,
          isSignatureValidation: true,
          isUserOpValidation: true,
        },
        selectors: [],
        installData: WebAuthnValidationModule.encodeOnInstallData({
          entityId: 1,
          x,
          y,
        }),
        hooks: [],
      });

    // wait for the UserOperation to be mined
    await provider.waitForUserOperationReceipt({ hash, timeout: 30_000 });

    // create session key client
    const sessionKeyClient = await givenConnectedProvider({
      signer: toWebAuthnAccount(sessionKeyCredential),
      accountAddress: provider.account.address,
      signerEntity: { entityId: 1, isGlobalValidation: true },
      // We don't need factory args here since we already installed the validation on-chain, which deployed the acct.
    });

    const sessionKeyHash = await sessionKeyClient.sendUserOperation({
      calls: [
        {
          to: target,
          value: sendAmount,
          data: "0x",
        },
      ],
    });

    await sessionKeyClient.waitForUserOperationReceipt({
      hash: sessionKeyHash,
      timeout: 30_000,
    });
  });

  it.fails(
    "successfully sign and validate a message, for WebAuthn account",
    async () => {
      const credential = await givenWebauthnCredential();

      const provider = await givenConnectedProvider({
        signer: toWebAuthnAccount(credential),
      });

      await setBalance(instance.getClient(), {
        address: provider.account.address,
        value: parseEther("2"),
      });

      const message = "0xdecafbad";

      const signature = await provider.account.signMessage({ message });

      const publicClient = instance.getClient().extend(publicActions);

      const isValid = await publicClient.verifyMessage({
        message,
        address: provider.account.address,
        signature,
      });

      expect(isValid).toBe(true);
    }
  );

  it.fails(
    "successfully sign and validate typed data, for WebAuthn account",
    async () => {
      const credential = await givenWebauthnCredential();

      const provider = await givenConnectedProvider({
        signer: toWebAuthnAccount(credential),
      });

      await setBalance(instance.getClient(), {
        address: provider.account.address,
        value: parseEther("2"),
      });

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

      const signature = await provider.account.signTypedData(typedData);

      const publicClient = instance.getClient().extend(publicActions);

      const isValid = await publicClient.verifyTypedData({
        ...typedData,
        address: provider.account.address,
        signature,
      });

      expect(isValid).toBe(true);
    }
  );

  it(
    "successfully sign and validate a message, for native and single signer validation",
    { retry: 3, timeout: 30_000 },
    async () => {
      const provider = (await givenConnectedProvider({ signer: owner })).extend(
        installValidationActions
      );

      await setBalance(instance.getClient(), {
        address: provider.account.address,
        value: parseEther("2"),
      });

      const accountContract = getContract({
        address: provider.account.address,
        abi: semiModularAccountBytecodeAbi,
        client,
      });

      // UO deploys the account to test 1271 against
      const hash = await provider.installValidation({
        validationConfig: {
          moduleAddress: DefaultModuleAddress.SINGLE_SIGNER_VALIDATION,
          entityId: 1,
          isGlobal: true,
          isSignatureValidation: true,
          isUserOpValidation: true,
        },
        selectors: [],
        installData: SingleSignerValidationModule.encodeOnInstallData({
          entityId: 1,
          signer: sessionKey.address,
        }),
        hooks: [],
      });

      await provider.waitForUserOperationReceipt({ hash, timeout: 30_000 });

      const message = "testmessage";

      const signature = await provider.account.signMessage({
        message,
      });

      await expect(
        accountContract.read.isValidSignature([hashMessage(message), signature])
      ).resolves.toEqual(VALID_1271_SIG_MAGIC_BYTES);

      // connect session key
      const sessionKeyClient = await givenConnectedProvider({
        signer: sessionKey,
        accountAddress: provider.account.address,
        signerEntity: { entityId: 1, isGlobalValidation: true },
      });

      const sessionKeySig = await sessionKeyClient.account.signMessage({
        message,
      });

      await expect(
        accountContract.read.isValidSignature([
          hashMessage(message),
          sessionKeySig,
        ])
      ).resolves.toEqual(VALID_1271_SIG_MAGIC_BYTES);
    }
  );

  it(
    "successfully sign and validate typed data messages, for native and single signer validation",
    { retry: 3, timeout: 30_000 },
    async () => {
      const provider = (await givenConnectedProvider({ signer: owner })).extend(
        installValidationActions
      );

      await setBalance(instance.getClient(), {
        address: provider.account.address,
        value: parseEther("2"),
      });

      const accountContract = getContract({
        address: provider.account.address,
        abi: semiModularAccountBytecodeAbi,
        client,
      });

      // UO deploys the account to test 1271 against
      const hash = await provider.installValidation({
        validationConfig: {
          moduleAddress: DefaultModuleAddress.SINGLE_SIGNER_VALIDATION,
          entityId: 1,
          isGlobal: true,
          isSignatureValidation: true,
          isUserOpValidation: true,
        },
        selectors: [],
        installData: SingleSignerValidationModule.encodeOnInstallData({
          entityId: 1,
          signer: sessionKey.address,
        }),
        hooks: [],
      });

      await provider.waitForUserOperationReceipt({ hash, timeout: 30_000 });

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

      const { type, data } = await provider.account.prepareSignature({
        type: "eth_signTypedData_v4",
        data: typedData,
      });

      if (type !== "eth_signTypedData_v4") {
        throw new Error("Invalid signature request type");
      }

      const signature = await owner.signTypedData(data);

      const fmtSignature = await provider.account.formatSignature(signature);

      await expect(
        accountContract.read.isValidSignature([
          hashedMessageTypedData,
          fmtSignature,
        ])
      ).resolves.toEqual(VALID_1271_SIG_MAGIC_BYTES);

      // connect session key
      const sessionKeyClient = await givenConnectedProvider({
        signer: sessionKey,
        accountAddress: provider.account.address,
        signerEntity: { entityId: 1, isGlobalValidation: true },
      });

      const sessionKeySignature =
        await sessionKeyClient.account.signTypedData(typedData);

      await expect(
        accountContract.read.isValidSignature([
          hashedMessageTypedData,
          sessionKeySignature,
        ])
      ).resolves.toEqual(VALID_1271_SIG_MAGIC_BYTES);
    }
  );

  it("adds a session key with no permissions", async () => {
    const provider = (await givenConnectedProvider({ signer: owner })).extend(
      installValidationActions
    );

    await setBalance(client, {
      address: provider.account.address,
      value: parseEther("2"),
    });

    const hash = await provider.installValidation({
      validationConfig: {
        moduleAddress: DefaultModuleAddress.SINGLE_SIGNER_VALIDATION,
        entityId: 1,
        isGlobal: true,
        isSignatureValidation: true,
        isUserOpValidation: true,
      },
      selectors: [],
      installData: SingleSignerValidationModule.encodeOnInstallData({
        entityId: 1,
        signer: sessionKey.address,
      }),
      hooks: [],
    });

    await provider.waitForUserOperationReceipt({ hash, timeout: 30_000 });

    const startingAddressBalance = await getTargetBalance();

    // connect session key and send tx with session key
    const sessionKeyClient = await givenConnectedProvider({
      signer: sessionKey,
      accountAddress: provider.account.address,
      signerEntity: { entityId: 1, isGlobalValidation: true },
    });

    const sessionKeyHash = await sessionKeyClient.sendUserOperation({
      calls: [
        {
          to: target,
          value: sendAmount,
          data: "0x",
        },
      ],
    });

    await sessionKeyClient.waitForUserOperationReceipt({
      hash: sessionKeyHash,
      timeout: 30_000,
    });

    await expect(getTargetBalance()).resolves.toEqual(
      startingAddressBalance + sendAmount
    );
  });

  it(
    "installs a session key via deferred action using PermissionBuilder signed by the owner and has it sign a UO",
    { retry: 3, timeout: 30_000 },
    async () => {
      const provider = (
        await givenConnectedProvider({
          signer: owner,
        })
      )
        .extend(installValidationActions)
        .extend(deferralActions);

      await setBalance(client, {
        address: provider.account.address,
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
            publicKey: sessionKey.address,
            type: "secp256k1",
          },
          entityId,
          nonce,
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

      const deferredValidationSig = await owner.signTypedData(typedData);

      // Build the full hex to prepend to the UO signature
      const deferredActionDigest = buildDeferredActionDigest({
        fullPreSignatureDeferredActionDigest,
        sig: concatHex([SignaturePrefix.EOA, deferredValidationSig]),
      });

      // Initialize the session key client corresponding to the session key we will install in the deferred action
      const sessionKeyClient = await givenConnectedProvider({
        signer: sessionKey,
        accountAddress: provider.account.address,
        factoryArgs: await provider.account.getFactoryArgs(),
        deferredAction: deferredActionDigest,
      });

      // Send the UserOp
      const hash = await sessionKeyClient.sendUserOperation({
        calls: [
          {
            to: target,
            value: sendAmount,
            data: "0x",
          },
        ],
      });

      await provider.waitForUserOperationReceipt({ hash, timeout: 30_000 });
    }
  );

  it(
    "installs a session key via deferred action using PermissionBuilder with ERC20 permission signed by the owner and has it sign a UO",
    { retry: 3, timeout: 30_000 },
    async () => {
      const provider = (
        await givenConnectedProvider({
          signer: owner,
        })
      )
        .extend(installValidationActions)
        .extend(deferralActions);

      await setBalance(client, {
        address: provider.account.address,
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
        args: [provider.account.address, 1000n],
      });

      const { entityId, nonce } = await provider.getEntityIdAndNonce({
        isGlobalValidation: false, // assumes the session key is used to sign the UO
      });

      // Must be built with the client that's going to sign the deferred action
      // OR a client with the same set signer entity as the signing client (entityId + isGlobal)
      const { typedData, fullPreSignatureDeferredActionDigest } =
        await new PermissionBuilder({
          client: provider,
          key: {
            publicKey: sessionKey.address,
            type: "secp256k1",
          },
          entityId,
          nonce,
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

      const deferredValidationSig = await owner.signTypedData(typedData);

      // Build the full hex to prepend to the UO signature
      const deferredActionDigest = buildDeferredActionDigest({
        fullPreSignatureDeferredActionDigest,
        // Note: If signing w/ the owner's actual EOA instead of the `provider.account`,
        // this must prepended with `SignaturePrefix.EOA` (0x00).
        sig: concatHex([SignaturePrefix.EOA, deferredValidationSig]),
      });

      // Initialize the session key client corresponding to the session key we will install in the deferred action
      const sessionKeyClient = await givenConnectedProvider({
        signer: sessionKey,
        accountAddress: provider.account.address,
        factoryArgs: await provider.account.getFactoryArgs(),
        deferredAction: deferredActionDigest,
        // No need for entity id here since it's contained within the deferred action.
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
        calls: [
          {
            to: mockErc20Address,
            data: encodeFunctionData({
              abi: mintableERC20Abi,
              functionName: "transfer",
              args: [target, 900n],
            }),
          },
        ],
      });

      await provider.waitForUserOperationReceipt({ hash });

      // Validate the erc20 transfer happened
      expect(
        await client.readContract({
          address: mockErc20Address,
          abi: mintableERC20Abi,
          functionName: "balanceOf",
          args: [target],
        })
      ).to.eq(900n);
    }
  );

  it(
    "Low-level installs a session key via deferred action signed by the owner and has it sign a UO",
    { retry: 3, timeout: 30_000 },
    async () => {
      const provider = (await givenConnectedProvider({ signer: owner }))
        .extend(installValidationActions)
        .extend(deferralActions);

      await setBalance(client, {
        address: provider.account.address,
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
          moduleAddress: DefaultModuleAddress.SINGLE_SIGNER_VALIDATION,
          entityId: entityId,
          isGlobal: isGlobalValidation,
          isSignatureValidation: true,
          isUserOpValidation: true,
        },
        selectors: [],
        installData: SingleSignerValidationModule.encodeOnInstallData({
          entityId: entityId,
          signer: sessionKey.address,
        }),
        hooks: [],
      });

      // Build the typed data we need for the deferred action (provider/client only used for account address & entrypoint)
      const { typedData } = await provider.createDeferredActionTypedDataObject({
        callData: encodedInstallData,
        deadline: 0,
        nonce,
      });

      const deferredValidationSig = await owner.signTypedData(typedData);

      const fullPreSignatureDeferredActionDigest =
        provider.buildPreSignatureDeferredActionDigest({
          typedData,
        });

      // Build the full hex to prepend to the UO signature
      const deferredActionDigest = buildDeferredActionDigest({
        fullPreSignatureDeferredActionDigest,
        sig: concatHex([SignaturePrefix.EOA, deferredValidationSig]),
      });

      // preExecHooks 00, nonce, deferredActionDigest
      const fullDeferredAction = concatHex([
        "0x00",
        toHex(nonce, { size: 32 }),
        deferredActionDigest,
      ]);

      // Initialize the session key client corresponding to the session key we will install in the deferred action
      const sessionKeyClient = await givenConnectedProvider({
        signer: sessionKey,
        accountAddress: provider.account.address,
        factoryArgs: await provider.account.getFactoryArgs(),
        deferredAction: fullDeferredAction,
      });

      // Build the full UO with the deferred action signature prepend (provider/client only used for account address & entrypoint)
      const unsignedUo = await sessionKeyClient.prepareUserOperation({
        calls: [{ to: target, data: "0x" }],
      });

      // Sign the UO with the session key
      const signature =
        await sessionKeyClient.account.signUserOperation(unsignedUo);

      // Send the raw UserOp
      const hash = await sessionKeyClient.sendUserOperation({
        ...unsignedUo,
        signature,
      });

      await provider.waitForUserOperationReceipt({ hash, timeout: 30_000 });
    }
  );

  it(
    "installs a session key via deferred action signed by another session key and has it sign a UO",
    { retry: 3, timeout: 30_000 },
    async () => {
      const provider = (await givenConnectedProvider({ signer: owner }))
        .extend(installValidationActions)
        .extend(deferralActions);

      await setBalance(client, {
        address: provider.account.address,
        value: parseEther("2"),
      });

      const sessionKeyEntityId = 1;

      // First, install a session key
      const hash = await provider.installValidation({
        validationConfig: {
          moduleAddress: DefaultModuleAddress.SINGLE_SIGNER_VALIDATION,
          entityId: sessionKeyEntityId,
          isGlobal: true,
          isSignatureValidation: true,
          isUserOpValidation: true,
        },
        selectors: [],
        installData: SingleSignerValidationModule.encodeOnInstallData({
          entityId: sessionKeyEntityId,
          signer: sessionKey.address,
        }),
        hooks: [],
      });

      await provider.waitForUserOperationReceipt({ hash, timeout: 30_000 });

      // Create a client with the first session key
      const sessionKeyClient = (
        await givenConnectedProvider({
          signer: sessionKey,
          accountAddress: provider.account.address,
          signerEntity: {
            entityId: sessionKeyEntityId,
            isGlobalValidation: true,
          },
        })
      )
        .extend(installValidationActions)
        .extend(deferralActions);

      const sessionKey2 = privateKeyToAccount(generatePrivateKey());

      const { entityId, nonce } = await provider.getEntityIdAndNonce({
        isGlobalValidation: true,
      });

      // Must be built with the client that's going to sign the deferred action
      // OR a client with the same set signer entity as the signing client (entityId + isGlobal)
      const { typedData, fullPreSignatureDeferredActionDigest } =
        await new PermissionBuilder({
          client: sessionKeyClient,
          key: {
            publicKey: sessionKey2.address,
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

      // Sign the typed data using the first session key.
      // If signing a deferred action w/ a session key, it's
      // important to use the SCA to sign the typed data
      // instead of using the session key signer directly!
      const deferredValidationSig =
        await sessionKeyClient.account.signTypedData(typedData);

      // Build the full hex to prepend to the UO signature
      const deferredActionDigest = buildDeferredActionDigest({
        fullPreSignatureDeferredActionDigest,
        sig: deferredValidationSig,
      });

      // Initialize the session key client corresponding to the session key we will install in the deferred action
      let newSessionKeyClient = await givenConnectedProvider({
        signer: sessionKey2,
        accountAddress: provider.account.address,
        factoryArgs: await provider.account.getFactoryArgs(),
        deferredAction: deferredActionDigest,
      });

      // Send the UserOp (provider/client only used for account address & entrypoint)
      const hash2 = await newSessionKeyClient.sendUserOperation({
        calls: [
          {
            to: target,
            data: "0x",
          },
        ],
      });

      await provider.waitForUserOperationReceipt({
        hash: hash2,
        timeout: 30_000,
      });
    }
  );

  it("uninstalls a session key", async () => {
    const provider = (await givenConnectedProvider({ signer: owner })).extend(
      installValidationActions
    );

    await setBalance(client, {
      address: provider.account.address,
      value: parseEther("2"),
    });

    const hash = await provider.installValidation({
      validationConfig: {
        moduleAddress: DefaultModuleAddress.SINGLE_SIGNER_VALIDATION,
        entityId: 1,
        isGlobal: true,
        isSignatureValidation: true,
        isUserOpValidation: true,
      },
      selectors: [],
      installData: SingleSignerValidationModule.encodeOnInstallData({
        entityId: 1,
        signer: sessionKey.address,
      }),
      hooks: [],
    });

    await provider.waitForUserOperationReceipt({ hash, timeout: 30_000 });

    const hash2 = await provider.uninstallValidation({
      moduleAddress: DefaultModuleAddress.SINGLE_SIGNER_VALIDATION,
      entityId: 1,
      uninstallData: SingleSignerValidationModule.encodeOnUninstallData({
        entityId: 1,
      }),
      hookUninstallDatas: [],
    });

    await provider.waitForUserOperationReceipt({
      hash: hash2,
      timeout: 30_000,
    });

    // connect session key and send tx with session key
    const sessionKeyClient = await givenConnectedProvider({
      signer: sessionKey,
      accountAddress: provider.account.address,
      signerEntity: { entityId: 1, isGlobalValidation: true },
    });

    await expect(
      sessionKeyClient.sendUserOperation({
        calls: [
          {
            to: target,
            value: sendAmount,
            data: "0x",
          },
        ],
      })
    ).rejects.toThrowError();
  });

  it.fails(
    "installs paymaster guard module, verifies use of valid paymaster, then uninstalls module",
    async () => {
      const provider = (
        await givenConnectedProvider({
          signer: owner,
          paymasterMiddleware: "erc7677",
        })
      ).extend(installValidationActions);

      await setBalance(client, {
        address: provider.account.address,
        value: parseEther("20"),
      });

      const paymaster = paymaster070.getPaymasterDetails().address;

      const hookInstallData = PaymasterGuardModule.encodeOnInstallData({
        entityId: 1,
        paymaster: paymaster,
      });

      const hash = await provider.installValidation({
        validationConfig: {
          moduleAddress: DefaultModuleAddress.SINGLE_SIGNER_VALIDATION,
          entityId: 1,
          isGlobal: true,
          isSignatureValidation: true,
          isUserOpValidation: true,
        },
        selectors: [],
        installData: SingleSignerValidationModule.encodeOnInstallData({
          entityId: 1,
          signer: sessionKey.address,
        }),
        hooks: [
          {
            hookConfig: {
              address: DefaultModuleAddress.PAYMASTER_GUARD,
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
      await provider.waitForUserOperationReceipt({ hash, timeout: 30_000 });

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
      const hash2 = await sessionKeyProvider.sendUserOperation({
        calls: [
          {
            to: zeroAddress,
            value: 0n,
            data: "0x",
          },
        ],
      });

      // verify if correct paymaster is used
      await sessionKeyProvider.waitForUserOperationReceipt({
        hash: hash2,
        timeout: 30_000,
      });

      const hookUninstallData = PaymasterGuardModule.encodeOnUninstallData({
        entityId: 1,
      });

      const hash3 = await provider.uninstallValidation({
        moduleAddress: DefaultModuleAddress.SINGLE_SIGNER_VALIDATION,
        entityId: 1,
        uninstallData: SingleSignerValidationModule.encodeOnUninstallData({
          entityId: 1,
        }),
        hookUninstallDatas: [hookUninstallData],
      });

      // verify uninstall
      await expect(
        provider.waitForUserOperationReceipt({ hash: hash3, timeout: 30_000 })
      ).resolves.not.toThrowError();
    }
  );

  it("installs paymaster guard module, verifies use of invalid paymaster, then uninstalls module", async () => {
    const provider = (
      await givenConnectedProvider({
        signer: owner,
        paymasterMiddleware: "erc7677",
      })
    ).extend(installValidationActions);

    await setBalance(client, {
      address: provider.account.address,
      value: parseEther("2"),
    });

    const paymaster = paymaster070.getPaymasterDetails().address;

    const hookInstallData = PaymasterGuardModule.encodeOnInstallData({
      entityId: 1,
      paymaster: paymaster,
    });

    const hash = await provider.installValidation({
      validationConfig: {
        moduleAddress: DefaultModuleAddress.SINGLE_SIGNER_VALIDATION,
        entityId: 1,
        isGlobal: true,
        isSignatureValidation: true,
        isUserOpValidation: true,
      },
      selectors: [],
      installData: SingleSignerValidationModule.encodeOnInstallData({
        entityId: 1,
        signer: sessionKey.address,
      }),
      hooks: [
        {
          hookConfig: {
            address: DefaultModuleAddress.PAYMASTER_GUARD,
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
    await provider.waitForUserOperationReceipt({ hash, timeout: 30_000 });

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
        calls: [
          {
            to: target,
            value: sendAmount,
            data: "0x",
          },
        ],
      })
    ).rejects.toThrowError();

    const hookUninstallData = PaymasterGuardModule.encodeOnUninstallData({
      entityId: 1,
    });

    const hash2 = await provider.uninstallValidation({
      moduleAddress: DefaultModuleAddress.SINGLE_SIGNER_VALIDATION,
      entityId: 1,
      uninstallData: SingleSignerValidationModule.encodeOnUninstallData({
        entityId: 1,
      }),
      hookUninstallDatas: [hookUninstallData],
    });

    // verify uninstall
    await expect(
      provider.waitForUserOperationReceipt({ hash: hash2, timeout: 30_000 })
    ).resolves.not.toThrowError();
  });

  it("installs allowlist module, uses, then uninstalls", async () => {
    const provider = (await givenConnectedProvider({ signer: owner })).extend(
      installValidationActions
    );

    await setBalance(client, {
      address: provider.account.address,
      value: parseEther("2"),
    });

    // install validation module
    const hash = await provider.installValidation({
      validationConfig: {
        moduleAddress: DefaultModuleAddress.SINGLE_SIGNER_VALIDATION,
        entityId: 1,
        isGlobal: true,
        isSignatureValidation: true,
        isUserOpValidation: true,
      },
      selectors: [],
      installData: SingleSignerValidationModule.encodeOnInstallData({
        entityId: 1,
        signer: sessionKey.address,
      }),
      hooks: [],
    });

    await provider.waitForUserOperationReceipt({ hash, timeout: 30_000 });

    // create session key client
    const sessionKeyProvider = (
      await givenConnectedProvider({
        signer: sessionKey,
        accountAddress: provider.account.address,
        signerEntity: { entityId: 1, isGlobalValidation: true },
      })
    ).extend(installValidationActions);

    // verify we can call into the zero address before allow list hook is installed
    const hash2 = await sessionKeyProvider.sendUserOperation({
      calls: [
        {
          to: zeroAddress,
          value: 0n,
          data: "0x",
        },
      ],
    });

    await provider.waitForUserOperationReceipt({
      hash: hash2,
      timeout: 30_000,
    });

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
    const hash3 = await provider.installValidation({
      validationConfig: {
        moduleAddress: DefaultModuleAddress.SINGLE_SIGNER_VALIDATION,
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
            address: DefaultModuleAddress.ALLOWLIST,
            entityId: 1,
            hookType: HookType.VALIDATION,
            hasPreHooks: true,
            hasPostHooks: false,
          },
          initData: hookInstallData,
        },
      ],
    });

    await provider.waitForUserOperationReceipt({
      hash: hash3,
      timeout: 30_000,
    });

    // Test that the allowlist is active.
    // We should *only* be able to call into the target address, as it's the only address we passed to onInstall.
    const hash4 = await sessionKeyProvider.sendUserOperation({
      calls: [
        {
          to: target,
          value: 0n,
          data: "0x",
        },
      ],
    });

    await provider.waitForUserOperationReceipt({
      hash: hash4,
      timeout: 30_000,
    });

    // This should revert as we're calling an address separate fom the allowlisted target.
    await expect(
      sessionKeyProvider.sendUserOperation({
        calls: [
          {
            to: zeroAddress,
            value: 0n,
            data: "0x",
          },
        ],
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

    const hash5 = await provider.uninstallValidation({
      moduleAddress: DefaultModuleAddress.SINGLE_SIGNER_VALIDATION,
      entityId: 1,
      uninstallData: SingleSignerValidationModule.encodeOnUninstallData({
        entityId: 1,
      }),
      hookUninstallDatas: [hookUninstallData],
    });

    await provider.waitForUserOperationReceipt({
      hash: hash5,
      timeout: 30_000,
    });
  });

  it(
    "installs native token limit module, uses, then uninstalls",
    { retry: 3, timeout: 30_000 },
    async () => {
      const provider = (await givenConnectedProvider({ signer: owner })).extend(
        installValidationActions
      );

      await setBalance(client, {
        address: provider.account.address,
        value: parseEther("10"),
      });

      const spendLimit = parseEther("0.5");

      const hash = await provider.installValidation({
        validationConfig: {
          moduleAddress: DefaultModuleAddress.SINGLE_SIGNER_VALIDATION,
          entityId: 1,
          isGlobal: true,
          isSignatureValidation: true,
          isUserOpValidation: true,
        },
        selectors: [],
        installData: SingleSignerValidationModule.encodeOnInstallData({
          entityId: 1,
          signer: sessionKey.address,
        }),
        hooks: [
          {
            hookConfig: {
              address: DefaultModuleAddress.NATIVE_TOKEN_LIMIT,
              entityId: 1,
              hookType: HookType.VALIDATION,
              hasPreHooks: true,
              hasPostHooks: false,
            },
            initData: NativeTokenLimitModule.encodeOnInstallData({
              entityId: 1,
              spendLimit,
            }),
          },
          {
            hookConfig: {
              address: DefaultModuleAddress.NATIVE_TOKEN_LIMIT,
              entityId: 1,
              hookType: HookType.EXECUTION,
              hasPreHooks: true,
              hasPostHooks: false,
            },
            initData: "0x",
          },
        ],
      });

      await provider.waitForUserOperationReceipt({ hash, timeout: 30_000 });

      // create session key client
      const sessionKeyProvider = (
        await givenConnectedProvider({
          signer: sessionKey,
          accountAddress: provider.account.address,
          signerEntity: { entityId: 1, isGlobalValidation: true },
        })
      ).extend(installValidationActions);

      // Try to send less than the limit - should pass
      const hash4 = await sessionKeyProvider.sendUserOperation({
        calls: [
          {
            to: target,
            value: parseEther("0.05"), // below the 0.5 limit
            data: "0x",
          },
        ],
      });
      await provider.waitForUserOperationReceipt({
        hash: hash4,
        timeout: 30_000,
      });

      // Try to send more than the limit - should fail
      await expect(
        sessionKeyProvider.sendUserOperation({
          calls: [
            {
              to: target,
              value: parseEther("0.6"), // passing the 0.5 limit
              data: "0x",
            },
          ],
        })
      ).rejects.toThrowError();

      const hash5 = await provider.uninstallValidation({
        moduleAddress: DefaultModuleAddress.SINGLE_SIGNER_VALIDATION,
        entityId: 1,
        uninstallData: SingleSignerValidationModule.encodeOnUninstallData({
          entityId: 1,
        }),
        hookUninstallDatas: [
          NativeTokenLimitModule.encodeOnUninstallData({
            entityId: 1,
          }),
          "0x",
        ],
      });

      await provider.waitForUserOperationReceipt({
        hash: hash5,
        timeout: 30_000,
      });
    }
  );

  it("installs time range module, sends transaction within valid time range", async () => {
    const provider = (
      await givenConnectedProvider({
        signer: owner,
      })
    ).extend(installValidationActions);

    await setBalance(client, {
      address: provider.account.address,
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

    const hash = await provider.installValidation({
      validationConfig: {
        moduleAddress: DefaultModuleAddress.SINGLE_SIGNER_VALIDATION,
        entityId: 1,
        isGlobal: true,
        isSignatureValidation: true,
        isUserOpValidation: true,
      },
      selectors: [],
      installData: SingleSignerValidationModule.encodeOnInstallData({
        entityId: 1,
        signer: sessionKey.address,
      }),
      hooks: [
        {
          hookConfig: {
            address: DefaultModuleAddress.TIME_RANGE,
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
    await provider.waitForUserOperationReceipt({ hash, timeout: 30_000 });

    client.setAutomine(false);

    // force block timestamp to be inside of range
    await client.setNextBlockTimestamp({
      timestamp: 1754507101n,
    });

    await client.mine({
      blocks: 1,
    });

    const uo = await sessionKeyProvider.prepareUserOperation({
      calls: [
        {
          to: target,
          data: "0x",
        },
      ],
    });

    const signature = await sessionKeyProvider.account.signUserOperation(uo);

    const signedUo = { ...uo, signature };

    // calls entrypoint directly
    await client.simulateContract({
      address: sessionKeyProvider.account.entryPoint.address,
      abi: entryPoint07Abi,
      functionName: "handleOps",
      args: [
        [
          {
            sender: sessionKeyProvider.account.address,
            nonce: signedUo.nonce,
            initCode:
              signedUo.factory && signedUo.factoryData
                ? concat([signedUo.factory, signedUo.factoryData])
                : "0x",
            callData: signedUo.callData,
            accountGasLimits: packAccountGasLimits({
              verificationGasLimit: signedUo.verificationGasLimit,
              callGasLimit: signedUo.callGasLimit,
            }),
            preVerificationGas: signedUo.preVerificationGas,
            gasFees: packAccountGasLimits({
              maxPriorityFeePerGas: signedUo.maxPriorityFeePerGas,
              maxFeePerGas: signedUo.maxFeePerGas,
            }),
            paymasterAndData:
              signedUo.paymaster && isAddress(signedUo.paymaster)
                ? packPaymasterData({
                    paymaster: signedUo.paymaster,
                    paymasterVerificationGasLimit:
                      signedUo.paymasterVerificationGasLimit,
                    paymasterPostOpGasLimit: signedUo.paymasterPostOpGasLimit,
                    paymasterData: signedUo.paymasterData,
                  })
                : "0x",
            signature: signedUo.signature,
          },
        ],
        provider.account.address,
      ],
      account: sessionKey.address,
    });

    client.setAutomine(true);
  });

  // NOTE: uses different validation and hook entity id than previous test because we do not uninstall the hook in the previous test
  it("installs time range module, tries to send transaction outside valid time range", async () => {
    const provider = (
      await givenConnectedProvider({
        signer: owner,
      })
    ).extend(installValidationActions);

    await setBalance(client, {
      address: provider.account.address,
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

    const hash = await provider.installValidation({
      validationConfig: {
        moduleAddress: DefaultModuleAddress.SINGLE_SIGNER_VALIDATION,
        entityId: 2,
        isGlobal: true,
        isSignatureValidation: true,
        isUserOpValidation: true,
      },
      selectors: [],
      installData: SingleSignerValidationModule.encodeOnInstallData({
        entityId: 2,
        signer: sessionKey.address,
      }),
      hooks: [
        {
          hookConfig: {
            address: DefaultModuleAddress.TIME_RANGE,
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
    await provider.waitForUserOperationReceipt({ hash, timeout: 30_000 });

    client.setAutomine(false);

    // force block timestamp to be outside of range
    await client.setNextBlockTimestamp({
      timestamp: 2054507101n,
    });

    await client.mine({
      blocks: 1,
    });

    const uo = await sessionKeyProvider.prepareUserOperation({
      calls: [
        {
          to: target,
          data: "0x",
        },
      ],
    });

    const signature = await sessionKeyProvider.account.signUserOperation(uo);

    const signedUo = {
      ...uo,
      signature,
    };

    // calls entrypoint directly
    try {
      await client.simulateContract({
        address: sessionKeyProvider.account.entryPoint.address,
        abi: entryPoint07Abi,
        functionName: "handleOps",
        args: [
          [
            {
              sender: sessionKeyProvider.account.address,
              nonce: signedUo.nonce,
              initCode:
                signedUo.factory && signedUo.factoryData
                  ? concat([signedUo.factory, signedUo.factoryData])
                  : "0x",
              callData: signedUo.callData,
              accountGasLimits: packAccountGasLimits({
                verificationGasLimit: signedUo.verificationGasLimit,
                callGasLimit: signedUo.callGasLimit,
              }),
              preVerificationGas: signedUo.preVerificationGas,
              gasFees: packAccountGasLimits({
                maxPriorityFeePerGas: signedUo.maxPriorityFeePerGas,
                maxFeePerGas: signedUo.maxFeePerGas,
              }),
              paymasterAndData:
                signedUo.paymaster && isAddress(signedUo.paymaster)
                  ? packPaymasterData({
                      paymaster: signedUo.paymaster,
                      paymasterVerificationGasLimit:
                        signedUo.paymasterVerificationGasLimit,
                      paymasterPostOpGasLimit: signedUo.paymasterPostOpGasLimit,
                      paymasterData: signedUo.paymasterData,
                    })
                  : "0x",
              signature: signedUo.signature,
            },
          ],
          provider.account.address,
        ],
        account: sessionKey.address,
      });
    } catch (err: any) {
      // verify that simulation fails due to violation of time range restriction on session key
      expect(
        err.metaMessages.some((str: string) =>
          str.includes("AA22 expired or not due")
        )
      ).toBe(true);
    }

    client.setAutomine(true);
  });

  it("tests entity id and nonce selection", async () => {
    const newClient = (await givenConnectedProvider({ signer: owner }))
      .extend(deferralActions)
      .extend(installValidationActions);

    await setBalance(client, {
      address: newClient.account.address,
      value: parseEther("2"),
    });

    const entryPoint = newClient.account.entryPoint;
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
    const hash = await newClient.installValidation({
      validationConfig: {
        moduleAddress: DefaultModuleAddress.SINGLE_SIGNER_VALIDATION,
        entityId: 1,
        isGlobal: true,
        isSignatureValidation: false,
        isUserOpValidation: false,
      },
      selectors: [],
      installData: SingleSignerValidationModule.encodeOnInstallData({
        entityId: 1,
        signer: sessionKey.address,
      }),
      hooks: [],
    });
    await newClient.waitForUserOperationReceipt({ hash, timeout: 30_000 });

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
    const hash2 = await newClient.installValidation({
      validationConfig: {
        moduleAddress: DefaultModuleAddress.SINGLE_SIGNER_VALIDATION,
        entityId: 2,
        isGlobal: false,
        isSignatureValidation: false,
        isUserOpValidation: false,
      },
      selectors,
      installData: SingleSignerValidationModule.encodeOnInstallData({
        entityId: 2,
        signer: sessionKey.address,
      }),
      hooks: [],
    });
    await newClient.waitForUserOperationReceipt({
      hash: hash2,
      timeout: 30_000,
    });

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
    const lightAccount = await toLightAccount({
      client: createWalletClient({
        account: owner,
        transport: custom(instance.getClient()),
        chain: instance.chain,
      }),
      version: "v2.0.0",
      owner,
    });

    const lightAccountClient = createBundlerClient({
      account: lightAccount,
      transport: custom(instance.getClient()),
      chain: instance.chain,
      userOperation: {
        // TODO(jh): use the action trevor made in other pr once merged.
        estimateFeesPerGas: async ({ bundlerClient }) => {
          const [block, maxPriorityFeePerGasEstimate] = await Promise.all([
            getBlock(bundlerClient, { blockTag: "latest" }),
            bundlerClient.request({
              // @ts-expect-error - This is fine.
              method: "rundler_maxPriorityFeePerGas",
            }),
          ]);

          const baseFeePerGas = block.baseFeePerGas;
          if (baseFeePerGas == null) throw new Error("baseFeePerGas is null");
          if (maxPriorityFeePerGasEstimate == null)
            throw new Error(
              "rundler_maxPriorityFeePerGas returned null or undefined"
            );

          // With RpcUserOperation typing, this should always be a hex string
          const maxPriorityFeePerGas = isHex(maxPriorityFeePerGasEstimate)
            ? BigInt(maxPriorityFeePerGasEstimate)
            : raise("Expected maxPriorityFeePerGasEstimate to be hex");

          return {
            maxPriorityFeePerGas,
            maxFeePerGas:
              bigIntMultiply(baseFeePerGas, 1.5) + maxPriorityFeePerGas,
          };
        },
      },
    });

    await setBalance(client, {
      address: lightAccountClient.account.address,
      value: parseEther("2"),
    });

    const upgradeData = await getMAV2UpgradeToData(owner.address);

    const encodedUpgradeData =
      await lightAccountClient.account.encodeUpgradeToAndCall({
        upgradeToAddress: upgradeData.implAddress,
        upgradeToInitData: upgradeData.initializationData,
      });

    const hash = await lightAccountClient.sendUserOperation({
      calls: [
        {
          to: lightAccount.address,
          data: encodedUpgradeData,
        },
      ],
    });

    await lightAccountClient.waitForUserOperationReceipt({
      hash,
      timeout: 30_000,
    });

    // TODO(jh): should we verify anything here? v4 test did not.
  });

  const givenWebauthnCredential = async () => {
    const webauthnDevice = new SoftWebauthnDevice();

    const credential = await createWebAuthnCredential({
      rp: { id: "localhost", name: "localhost" },
      createFn: (opts) => webauthnDevice.create(opts, "localhost"),
      user: { name: "test", displayName: "test" },
    });

    const getFn = (opts: CredentialRequestOptions | undefined) =>
      webauthnDevice.get(opts, "localhost");

    return { credential, getFn, rpId: "localhost" };
  };

  const givenConnectedProvider = async ({
    signer,
    signerEntity,
    accountAddress,
    paymasterMiddleware,
    factoryArgs,
    deferredAction,
  }: {
    signer: LocalAccount | WebAuthnAccount;
    signerEntity?: { entityId: number; isGlobalValidation: boolean };
    accountAddress?: Address;
    paymasterMiddleware?: "erc7677";
    factoryArgs?: { factory?: Address; factoryData?: Hex };
    deferredAction?: Hex;
  }) => {
    const account = await toModularAccountV2({
      client: createPublicClient({
        transport: custom(instance.getClient()),
        chain: instance.chain,
      }),
      accountAddress,
      signerEntity,
      owner: signer,
      ...factoryArgs,
      deferredAction,
    });

    return createBundlerClient({
      account,
      transport: custom(instance.getClient()),
      chain: instance.chain,
      paymaster: paymasterMiddleware === "erc7677" ? true : undefined,
      userOperation: {
        // TODO(jh): use the action trevor made in other pr once merged.
        estimateFeesPerGas: async ({ bundlerClient }) => {
          const [block, maxPriorityFeePerGasEstimate] = await Promise.all([
            getBlock(bundlerClient, { blockTag: "latest" }),
            bundlerClient.request({
              // @ts-expect-error - This is fine.
              method: "rundler_maxPriorityFeePerGas",
            }),
          ]);

          const baseFeePerGas = block.baseFeePerGas;
          if (baseFeePerGas == null) throw new Error("baseFeePerGas is null");
          if (maxPriorityFeePerGasEstimate == null)
            throw new Error(
              "rundler_maxPriorityFeePerGas returned null or undefined"
            );

          // With RpcUserOperation typing, this should always be a hex string.
          const maxPriorityFeePerGas = isHex(maxPriorityFeePerGasEstimate)
            ? bigIntMultiply(BigInt(maxPriorityFeePerGasEstimate), 2)
            : raise("Expected maxPriorityFeePerGasEstimate to be hex");

          return {
            maxPriorityFeePerGas,
            maxFeePerGas:
              bigIntMultiply(baseFeePerGas, 2) + maxPriorityFeePerGas,
          };
        },
      },
    });
  };

  // TODO(jh): test 7702 (sending multiple UOs) ... verify if only EP 0.8 depends on magic value ("0x7702"), not viem itself
  // if only EP, then we may just not want to support returning factory data for 7702 accounts?
});

const mintableERC20Bytecode =
  "0x608060405234801561000f575f80fd5b506040518060400160405280600d81526020016c26b4b73a30b13632aa37b5b2b760991b81525060405180604001604052806002815260200161135560f21b8152508160039081610060919061010d565b50600461006d828261010d565b5050506101c7565b634e487b7160e01b5f52604160045260245ffd5b600181811c9082168061009d57607f821691505b6020821081036100bb57634e487b7160e01b5f52602260045260245ffd5b50919050565b601f82111561010857805f5260205f20601f840160051c810160208510156100e65750805b601f840160051c820191505b81811015610105575f81556001016100f2565b50505b505050565b81516001600160401b0381111561012657610126610075565b61013a816101348454610089565b846100c1565b6020601f82116001811461016c575f83156101555750848201515b5f19600385901b1c1916600184901b178455610105565b5f84815260208120601f198516915b8281101561019b578785015182556020948501946001909201910161017b565b50848210156101b857868401515f19600387901b60f8161c191681555b50505050600190811b01905550565b610737806101d45f395ff3fe608060405234801561000f575f80fd5b506004361061008c575f3560e01c806306fdde0314610090578063095ea7b3146100ae57806318160ddd146100d157806323b872dd146100e3578063313ce567146100f657806340c10f191461010557806370a082311461011a57806395d89b4114610142578063a9059cbb1461014a578063dd62ed3e1461015d575b5f80fd5b610098610170565b6040516100a59190610572565b60405180910390f35b6100c16100bc3660046105c2565b610200565b60405190151581526020016100a5565b6002545b6040519081526020016100a5565b6100c16100f13660046105ea565b610219565b604051601281526020016100a5565b6101186101133660046105c2565b61023c565b005b6100d5610128366004610624565b6001600160a01b03165f9081526020819052604090205490565b61009861024a565b6100c16101583660046105c2565b610259565b6100d561016b366004610644565b610266565b60606003805461017f90610675565b80601f01602080910402602001604051908101604052809291908181526020018280546101ab90610675565b80156101f65780601f106101cd576101008083540402835291602001916101f6565b820191905f5260205f20905b8154815290600101906020018083116101d957829003601f168201915b5050505050905090565b5f3361020d818585610290565b60019150505b92915050565b5f336102268582856102a2565b6102318585856102fc565b506001949350505050565b6102468282610359565b5050565b60606004805461017f90610675565b5f3361020d8185856102fc565b6001600160a01b039182165f90815260016020908152604080832093909416825291909152205490565b61029d838383600161038d565b505050565b5f6102ad8484610266565b90505f198110156102f657818110156102e857828183604051637dc7a0d960e11b81526004016102df939291906106ad565b60405180910390fd5b6102f684848484035f61038d565b50505050565b6001600160a01b038316610325575f604051634b637e8f60e11b81526004016102df91906106ce565b6001600160a01b03821661034e575f60405163ec442f0560e01b81526004016102df91906106ce565b61029d83838361045f565b6001600160a01b038216610382575f60405163ec442f0560e01b81526004016102df91906106ce565b6102465f838361045f565b6001600160a01b0384166103b6575f60405163e602df0560e01b81526004016102df91906106ce565b6001600160a01b0383166103df575f604051634a1406b160e11b81526004016102df91906106ce565b6001600160a01b038085165f90815260016020908152604080832093871683529290522082905580156102f657826001600160a01b0316846001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9258460405161045191815260200190565b60405180910390a350505050565b6001600160a01b038316610489578060025f82825461047e91906106e2565b909155506104e69050565b6001600160a01b0383165f90815260208190526040902054818110156104c85783818360405163391434e360e21b81526004016102df939291906106ad565b6001600160a01b0384165f9081526020819052604090209082900390555b6001600160a01b03821661050257600280548290039055610520565b6001600160a01b0382165f9081526020819052604090208054820190555b816001600160a01b0316836001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8360405161056591815260200190565b60405180910390a3505050565b602081525f82518060208401528060208501604085015e5f604082850101526040601f19601f83011684010191505092915050565b80356001600160a01b03811681146105bd575f80fd5b919050565b5f80604083850312156105d3575f80fd5b6105dc836105a7565b946020939093013593505050565b5f805f606084860312156105fc575f80fd5b610605846105a7565b9250610613602085016105a7565b929592945050506040919091013590565b5f60208284031215610634575f80fd5b61063d826105a7565b9392505050565b5f8060408385031215610655575f80fd5b61065e836105a7565b915061066c602084016105a7565b90509250929050565b600181811c9082168061068957607f821691505b6020821081036106a757634e487b7160e01b5f52602260045260245ffd5b50919050565b6001600160a01b039390931683526020830191909152604082015260600190565b6001600160a01b0391909116815260200190565b8082018082111561021357634e487b7160e01b5f52601160045260245ffdfea2646970667358221220f9ae46a2e15270bfb77fe3d4d0ee0e45b749e3dde93805ee2cf795cb800244e664736f6c634300081a0033";

const mintableERC20Abi = parseAbi([
  "function transfer(address to, uint256 amount) external",
  "function mint(address to, uint256 amount) external",
  "function balanceOf(address target) external returns (uint256)",
]);
