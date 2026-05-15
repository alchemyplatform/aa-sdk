import {
  concat,
  concatHex,
  createPublicClient,
  custom,
  decodeAbiParameters,
  isAddress,
  parseEther,
  parseGwei,
  publicActions,
  testActions,
  toHex,
  type Address,
  type Hex,
  type LocalAccount,
} from "viem";
import { createBundlerClient } from "viem/account-abstraction";
import { entryPoint07Abi } from "viem/account-abstraction";
import { mine, setBalance, setNextBlockBaseFeePerGas } from "viem/actions";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { localInstance } from "~test/instances.js";
import { toModularAccountV2 } from "../accounts/account.js";
import { deferralActions } from "./deferralActions.js";
import {
  PermissionBuilder,
  PermissionType,
  type Permission,
} from "../permissionBuilder.js";
import {
  RootPermissionOnlyError,
  SelectorNotAllowed,
} from "../../errors/permissionBuilderErrors.js";
import { InvalidEntityIdError } from "../../errors/InvalidEntityIdError.js";
import { DefaultModuleAddress } from "../utils/account.js";
import { HookType } from "../types.js";
import { encodeDeferredActionWithSignature } from "../utils/deferredActions.js";
import { SignaturePrefix } from "../types.js";
import { packAccountGasLimits, packPaymasterData } from "../../utils.js";
import { estimateFeesPerGas } from "@alchemy/aa-infra";

// Note: These tests maintain a shared state to not break the local-running rundler by desyncing the chain.
describe("MA v2 deferral actions tests", async () => {
  const target = "0x000000000000000000000000000000000000dEaD";
  const sendAmount = parseEther("1");

  let owner: LocalAccount;
  let sessionKey: LocalAccount;
  let deferredActionPayload: Hex;
  let accountAddress: Address;
  let factoryArgs: { factory?: Address; factoryData?: Hex } | undefined;

  beforeEach(async () => {
    owner = privateKeyToAccount(generatePrivateKey());
    sessionKey = privateKeyToAccount(generatePrivateKey());

    // set up and sign deferred action with client with owner connected
    const provider = (
      await givenConnectedProvider({
        signer: owner,
      })
    ).extend(deferralActions);

    await setBalance(localInstance.getClient(), {
      address: provider.account.address,
      value: parseEther("30"),
    });

    // these can be default values or from call arguments
    const { entityId, nonce } = await provider.getEntityIdAndNonce({
      isGlobalValidation: true,
    });

    const { typedData, fullPreSignatureDeferredActionPayload } =
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
            type: PermissionType.ROOT,
          },
        })
        .compileDeferred();

    const sig = await owner.signTypedData(typedData);

    deferredActionPayload = encodeDeferredActionWithSignature({
      fullPreSignatureDeferredActionPayload,
      // Note: If signing w/ the owner's actual EOA instead of the `provider.account`,
      // this must prepended with `SignaturePrefix.EOA` (0x00).
      sig: concatHex([SignaturePrefix.EOA, sig]),
    });

    accountAddress = provider.account.address;
    factoryArgs = await provider.account.getFactoryArgs();
  });

  it(
    "deferred action then send another uo from same client",
    { retry: 3, timeout: 30_000 },
    async () => {
      const sessionKeyClient = await givenConnectedProvider({
        signer: sessionKey,
        accountAddress,
        deferredAction: deferredActionPayload,
        factoryArgs,
      });

      const hash = await sessionKeyClient.sendUserOperation({
        calls: [
          {
            to: target,
            value: sendAmount / 2n,
            data: "0x",
          },
        ],
      });

      await setNextBlockBaseFeePerGas(localInstance.getClient(), {
        baseFeePerGas: parseGwei("1"),
      });

      await mine(localInstance.getClient(), { blocks: 5 });

      await sessionKeyClient.waitForUserOperationReceipt({
        hash,
        timeout: 10_000,
      });

      const hash2 = await sessionKeyClient.sendUserOperation({
        calls: [
          {
            to: target,
            value: sendAmount / 2n,
            data: "0x",
          },
        ],
      });

      await setNextBlockBaseFeePerGas(localInstance.getClient(), {
        baseFeePerGas: parseGwei("1"),
      });
      await mine(localInstance.getClient(), { blocks: 5 });

      await sessionKeyClient.waitForUserOperationReceipt({
        hash: hash2,
        timeout: 10_000,
      });
    },
  );

  it(
    "deferred action then send another uo from new client",
    { retry: 3, timeout: 30_000 },
    async () => {
      const sessionKeyClient = await givenConnectedProvider({
        signer: sessionKey,
        accountAddress,
        deferredAction: deferredActionPayload,
        factoryArgs,
      });

      const hash = await sessionKeyClient.sendUserOperation({
        calls: [
          {
            to: target,
            value: sendAmount / 2n,
            data: "0x",
          },
        ],
      });

      await setNextBlockBaseFeePerGas(localInstance.getClient(), {
        baseFeePerGas: 10n,
      });

      await sessionKeyClient.waitForUserOperationReceipt({
        hash,
        timeout: 10_000,
      });

      const sessionKeyClient2 = await givenConnectedProvider({
        signer: sessionKey,
        accountAddress,
        deferredAction: deferredActionPayload,
        factoryArgs,
      });

      const hash2 = await sessionKeyClient2.sendUserOperation({
        calls: [
          {
            to: target,
            value: sendAmount / 2n,
            data: "0x",
          },
        ],
      });

      await setNextBlockBaseFeePerGas(localInstance.getClient(), {
        baseFeePerGas: 10n,
      });

      await sessionKeyClient2.waitForUserOperationReceipt({
        hash: hash2,
        timeout: 10_000,
      });
    },
  );

  it("PermissionBuilder: Cannot add any permission after root", async () => {
    const provider = await givenConnectedProvider({ signer: owner });

    await setBalance(localInstance.getClient(), {
      address: provider.account.address,
      value: parseEther("2"),
    });

    // these can be default values or from call arguments
    const { entityId, nonce } = await provider
      .extend(deferralActions)
      .getEntityIdAndNonce({
        isGlobalValidation: true,
      });

    const allPermissions = generateAllPermissions();

    allPermissions.forEach(async (permission) => {
      await expect(async () => {
        new PermissionBuilder({
          client: provider.extend(deferralActions),
          key: {
            publicKey: sessionKey.address,
            type: "secp256k1",
          },
          entityId,
          nonce: nonce,
          deadline: 0,
        })
          .addPermission({
            permission: {
              type: PermissionType.ROOT,
            },
          })
          .addPermission({ permission });
      }).rejects.toThrow(new RootPermissionOnlyError(permission));
    });
  });

  it("PermissionBuilder: Cannot compile post expiry", async () => {
    const provider = await givenConnectedProvider({ signer: owner });

    await setBalance(localInstance.getClient(), {
      address: provider.account.address,
      value: parseEther("2"),
    });

    // these can be default values or from call arguments
    const { entityId, nonce } = await provider
      .extend(deferralActions)
      .getEntityIdAndNonce({
        isGlobalValidation: false,
      });

    const now = Date.now() / 1000;
    const deadline = Math.round(now / 2);

    await expect(async () => {
      await new PermissionBuilder({
        client: provider.extend(deferralActions),
        key: {
          publicKey: sessionKey.address,
          type: "secp256k1",
        },
        entityId,
        nonce,
        deadline,
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
    }).rejects.toThrowError(
      /compileDeferred\(\): deadline \d+ cannot be before now \(\d+(\.\d+)?\)/,
    );
  });

  it("PermissionBuilder: Cannot install expired deferred action", async () => {
    const client = localInstance
      .getClient()
      .extend(publicActions)
      .extend(testActions({ mode: "anvil" }));

    const provider = await givenConnectedProvider({ signer: owner });

    const { entityId, nonce } = await provider
      .extend(deferralActions)
      .getEntityIdAndNonce({
        isGlobalValidation: false,
      });

    const deadline = Math.round(Date.now() / 1000 + 10);

    const { typedData, fullPreSignatureDeferredActionPayload } =
      await new PermissionBuilder({
        client: provider.extend(deferralActions),
        key: {
          publicKey: sessionKey.address,
          type: "secp256k1",
        },
        entityId,
        nonce,
        deadline,
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
    const deferredActionPayload = encodeDeferredActionWithSignature({
      fullPreSignatureDeferredActionPayload,
      // Note: If signing w/ the owner's actual EOA instead of the `provider.account`,
      // this must prepended with `SignaturePrefix.EOA` (0x00).
      sig: concatHex([SignaturePrefix.EOA, deferredValidationSig]),
    });

    // Initialize the session key client corresponding to the session key we will install in the deferred action
    const sessionKeyClient = await givenConnectedProvider({
      signer: sessionKey,
      accountAddress,
      deferredAction: deferredActionPayload,
      factoryArgs,
    });

    const userOp = await sessionKeyClient.prepareUserOperation({
      calls: [
        {
          to: target,
          value: sendAmount,
          data: "0x",
        },
      ],
    });

    const signature = await sessionKeyClient.account.signUserOperation(userOp);

    const signedUo = {
      ...userOp,
      signature,
    };

    // Advance time
    await client.setNextBlockTimestamp({
      timestamp: BigInt(deadline) + 1000n,
    });

    await client.mine({
      blocks: 1,
    });

    await expect(async () => {
      return await client.simulateContract({
        address: provider.account.entryPoint.address,
        abi: entryPoint07Abi,
        functionName: "handleOps",
        args: [
          [
            {
              sender: provider.account.address,
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
    }).rejects.toThrow("AA22 expired or not due");
  });

  it("PermissionBuilder: Cannot add root after any permission", async () => {
    const provider = await givenConnectedProvider({ signer: owner });

    await setBalance(localInstance.getClient(), {
      address: provider.account.address,
      value: parseEther("2"),
    });

    // these can be default values or from call arguments
    const { entityId, nonce } = await provider
      .extend(deferralActions)
      .getEntityIdAndNonce({
        isGlobalValidation: true,
      });

    const allPermissions = generateAllPermissions();

    allPermissions.forEach(async (permission) => {
      await expect(async () => {
        return new PermissionBuilder({
          client: provider.extend(deferralActions),
          key: {
            publicKey: sessionKey.address,
            type: "secp256k1",
          },
          entityId,
          nonce: nonce,
          deadline: 0,
        })
          .addPermission({ permission })
          .addPermission({
            permission: {
              type: PermissionType.ROOT,
            },
          });
      }).rejects.toThrow(
        new RootPermissionOnlyError({
          type: PermissionType.ROOT,
        }),
      );
    });
  });

  const FORBIDDEN_SELECTOR_CASES: [Hex, string][] = [
    ["0xb61d27f6", "execute"],
    ["0x34fcd5be", "executeBatch"],
    ["0x5998db5c", "performCreate"],
    ["0xf2680c0f", "executeWithRuntimeValidation"],
    ["0x1bbf564c", "installValidation"],
    ["0xb6b1ccfe", "uninstallValidation"],
    ["0x1d37e7d6", "installExecution"],
    ["0x0b7cad71", "uninstallExecution"],
    ["0x4f1ef286", "upgradeToAndCall"],
  ];

  it.each(FORBIDDEN_SELECTOR_CASES)(
    "PermissionBuilder: constructor rejects forbidden selector %s (%s)",
    async (selector, _name) => {
      const provider = await givenConnectedProvider({ signer: owner });
      expect(
        () =>
          new PermissionBuilder({
            client: provider.extend(deferralActions),
            key: { publicKey: sessionKey.address, type: "secp256k1" },
            entityId: 1,
            nonce: 0n,
            selectors: [selector],
            deadline: 0,
          }),
      ).toThrow(SelectorNotAllowed);
    },
  );

  it.each(FORBIDDEN_SELECTOR_CASES)(
    "PermissionBuilder: addSelector rejects forbidden selector %s (%s)",
    async (selector, _name) => {
      const provider = await givenConnectedProvider({ signer: owner });
      const builder = new PermissionBuilder({
        client: provider.extend(deferralActions),
        key: { publicKey: sessionKey.address, type: "secp256k1" },
        entityId: 1,
        nonce: 0n,
        deadline: 0,
      });
      expect(() => builder.addSelector({ selector })).toThrow(
        SelectorNotAllowed,
      );
    },
  );

  it.each(FORBIDDEN_SELECTOR_CASES)(
    "PermissionBuilder: addPermission(ACCOUNT_FUNCTIONS) rejects forbidden selector %s (%s)",
    async (selector, _name) => {
      const provider = await givenConnectedProvider({ signer: owner });
      const builder = new PermissionBuilder({
        client: provider.extend(deferralActions),
        key: { publicKey: sessionKey.address, type: "secp256k1" },
        entityId: 1,
        nonce: 0n,
        deadline: 0,
      });
      expect(() =>
        builder.addPermission({
          permission: {
            type: PermissionType.ACCOUNT_FUNCTIONS,
            data: { functions: [selector] },
          },
        }),
      ).toThrow(SelectorNotAllowed);
    },
  );

  it("PermissionBuilder: rejects forbidden selector with mixed-case hex", async () => {
    const provider = await givenConnectedProvider({ signer: owner });
    const builder = new PermissionBuilder({
      client: provider.extend(deferralActions),
      key: { publicKey: sessionKey.address, type: "secp256k1" },
      entityId: 1,
      nonce: 0n,
      deadline: 0,
    });
    expect(() => builder.addSelector({ selector: "0x4F1EF286" })).toThrow(
      SelectorNotAllowed,
    );
  });

  it("PermissionBuilder: accepts non-forbidden selectors", async () => {
    const provider = await givenConnectedProvider({ signer: owner });
    const safeSelector: Hex = "0xdeadbeef";
    expect(
      () =>
        new PermissionBuilder({
          client: provider.extend(deferralActions),
          key: { publicKey: sessionKey.address, type: "secp256k1" },
          entityId: 1,
          nonce: 0n,
          selectors: [safeSelector],
          deadline: 0,
        }),
    ).not.toThrow();
  });

  const HALF_UINT32 = 2147483647;

  it.each([HALF_UINT32, HALF_UINT32 + 1, 4294967295])(
    "PermissionBuilder: constructor rejects entityId %s (reserved offset range)",
    async (entityId) => {
      const provider = await givenConnectedProvider({ signer: owner });
      expect(
        () =>
          new PermissionBuilder({
            client: provider.extend(deferralActions),
            key: { publicKey: sessionKey.address, type: "secp256k1" },
            entityId,
            nonce: 0n,
            deadline: 0,
          }),
      ).toThrow(InvalidEntityIdError);
    },
  );

  it("PermissionBuilder: GAS_LIMIT and NATIVE_TOKEN_TRANSFER install to distinct slots", async () => {
    const provider = await givenConnectedProvider({ signer: owner });
    const entityId = 7;

    const builder = new PermissionBuilder({
      client: provider.extend(deferralActions),
      key: { publicKey: sessionKey.address, type: "secp256k1" },
      entityId,
      nonce: 0n,
      deadline: 0,
    })
      .addPermission({
        permission: {
          type: PermissionType.NATIVE_TOKEN_TRANSFER,
          data: { allowance: toHex(parseEther("1")) },
        },
      })
      .addPermission({
        permission: {
          type: PermissionType.GAS_LIMIT,
          data: { limit: toHex(parseEther("0.01")) },
        },
      })
      .addSelector({ selector: "0xdeadbeef" });

    // compileRaw is what performs permission→hook translation; compileInstallArgs
    // alone just returns the current builder state without translating.
    await builder.compileRaw();
    const { hooks } = await builder.compileInstallArgs();

    const nativeHook = hooks.find(
      (h) =>
        h.hookConfig.address === DefaultModuleAddress.NATIVE_TOKEN_LIMIT &&
        h.hookConfig.hookType === HookType.EXECUTION,
    );
    const gasHook = hooks.find(
      (h) =>
        h.hookConfig.address === DefaultModuleAddress.NATIVE_TOKEN_LIMIT &&
        h.hookConfig.hookType === HookType.VALIDATION,
    );

    expect(nativeHook).toBeDefined();
    expect(gasHook).toBeDefined();

    // hookConfig.entityId drives runtime hook dispatch; initData drives onInstall storage slot.
    // Both must differ between NTT and GL or the gas install will overwrite the native cap.
    expect(nativeHook!.hookConfig.entityId).toBe(entityId);
    expect(gasHook!.hookConfig.entityId).toBe(entityId + HALF_UINT32);

    const [nativeInitEntityId, nativeSpendLimit] = decodeAbiParameters(
      [{ type: "uint32" }, { type: "uint256" }],
      nativeHook!.initData,
    );
    const [gasInitEntityId, gasSpendLimit] = decodeAbiParameters(
      [{ type: "uint32" }, { type: "uint256" }],
      gasHook!.initData,
    );

    expect(nativeInitEntityId).toBe(entityId);
    expect(gasInitEntityId).toBe(entityId + HALF_UINT32);
    expect(nativeSpendLimit).toBe(parseEther("1"));
    expect(gasSpendLimit).toBe(parseEther("0.01"));
  });

  it("PermissionBuilder: GAS_LIMIT alone is still installed at the offset entityId", async () => {
    // Regression guard: the offset must be unconditional. If anyone made it
    // conditional on NTT being present, the all-four integration test would
    // still pass but a GL-only caller would land at the un-offset slot.
    const provider = await givenConnectedProvider({ signer: owner });
    const entityId = 11;

    const builder = new PermissionBuilder({
      client: provider.extend(deferralActions),
      key: { publicKey: sessionKey.address, type: "secp256k1" },
      entityId,
      nonce: 0n,
      deadline: 0,
    })
      .addPermission({
        permission: {
          type: PermissionType.GAS_LIMIT,
          data: { limit: toHex(parseEther("0.01")) },
        },
      })
      .addSelector({ selector: "0xdeadbeef" });

    await builder.compileRaw();
    const { hooks } = await builder.compileInstallArgs();

    expect(hooks).toHaveLength(1);
    const gasHook = hooks[0];
    expect(gasHook.hookConfig.address).toBe(
      DefaultModuleAddress.NATIVE_TOKEN_LIMIT,
    );
    expect(gasHook.hookConfig.hookType).toBe(HookType.VALIDATION);
    expect(gasHook.hookConfig.entityId).toBe(entityId + HALF_UINT32);

    const [gasInitEntityId, gasSpendLimit] = decodeAbiParameters(
      [{ type: "uint32" }, { type: "uint256" }],
      gasHook.initData,
    );
    expect(gasInitEntityId).toBe(entityId + HALF_UINT32);
    expect(gasSpendLimit).toBe(parseEther("0.01"));
  });

  it("PermissionBuilder: ERC20_TOKEN_TRANSFER alone produces two distinct AllowlistModule slots", async () => {
    // Locks in the existing AllowlistModule offset pattern that GAS_LIMIT's
    // fix was modeled on. ERC20 produces both the spend-limit hook (offset)
    // and the approve/transfer selector allowlist (base entityId).
    const provider = await givenConnectedProvider({ signer: owner });
    const entityId = 13;
    const erc20Token: Address = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

    const builder = new PermissionBuilder({
      client: provider.extend(deferralActions),
      key: { publicKey: sessionKey.address, type: "secp256k1" },
      entityId,
      nonce: 0n,
      deadline: 0,
    }).addPermission({
      permission: {
        type: PermissionType.ERC20_TOKEN_TRANSFER,
        data: { address: erc20Token, allowance: toHex(1_000_000_000n) },
      },
    });

    await builder.compileRaw();
    const { hooks } = await builder.compileInstallArgs();

    expect(hooks).toHaveLength(2);

    const erc20Hook = hooks.find(
      (h) =>
        h.hookConfig.address === DefaultModuleAddress.ALLOWLIST &&
        h.hookConfig.hookType === HookType.EXECUTION,
    );
    const allowlistHook = hooks.find(
      (h) =>
        h.hookConfig.address === DefaultModuleAddress.ALLOWLIST &&
        h.hookConfig.hookType === HookType.VALIDATION,
    );

    expect(erc20Hook).toBeDefined();
    expect(allowlistHook).toBeDefined();
    expect(erc20Hook!.hookConfig.entityId).toBe(entityId + HALF_UINT32);
    expect(allowlistHook!.hookConfig.entityId).toBe(entityId);
  });

  it("PermissionBuilder: NTT + ERC20 + GAS_LIMIT produce four distinct hooks across both shared modules", async () => {
    const provider = await givenConnectedProvider({ signer: owner });
    const entityId = 9;
    const erc20Token: Address = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

    const builder = new PermissionBuilder({
      client: provider.extend(deferralActions),
      key: { publicKey: sessionKey.address, type: "secp256k1" },
      entityId,
      nonce: 0n,
      deadline: 0,
    })
      .addPermission({
        permission: {
          type: PermissionType.NATIVE_TOKEN_TRANSFER,
          data: { allowance: toHex(parseEther("1")) },
        },
      })
      .addPermission({
        permission: {
          type: PermissionType.ERC20_TOKEN_TRANSFER,
          data: { address: erc20Token, allowance: toHex(1_000_000_000n) },
        },
      })
      .addPermission({
        permission: {
          type: PermissionType.GAS_LIMIT,
          data: { limit: toHex(parseEther("0.01")) },
        },
      });

    await builder.compileRaw();
    const { hooks } = await builder.compileInstallArgs();

    // Expect exactly 4 hooks: NTT (exec, NTL@EID), ERC20 (exec, Allowlist@EID+X),
    // GAS_LIMIT (validation, NTL@EID+X), PREVAL_ALLOWLIST (validation, Allowlist@EID)
    expect(hooks).toHaveLength(4);

    const find = (address: Address, hookType: HookType) =>
      hooks.find(
        (h) =>
          h.hookConfig.address === address &&
          h.hookConfig.hookType === hookType,
      );

    const nttHook = find(
      DefaultModuleAddress.NATIVE_TOKEN_LIMIT,
      HookType.EXECUTION,
    );
    const gasHook = find(
      DefaultModuleAddress.NATIVE_TOKEN_LIMIT,
      HookType.VALIDATION,
    );
    const erc20Hook = find(DefaultModuleAddress.ALLOWLIST, HookType.EXECUTION);
    const allowlistHook = find(
      DefaultModuleAddress.ALLOWLIST,
      HookType.VALIDATION,
    );

    expect(nttHook).toBeDefined();
    expect(gasHook).toBeDefined();
    expect(erc20Hook).toBeDefined();
    expect(allowlistHook).toBeDefined();

    // Native token module: NTT at EID, GAS_LIMIT at EID + HALF_UINT32 → no collision.
    expect(nttHook!.hookConfig.entityId).toBe(entityId);
    expect(gasHook!.hookConfig.entityId).toBe(entityId + HALF_UINT32);

    // Allowlist module: PREVAL_ALLOWLIST at EID, ERC20 spend-limit at EID + HALF_UINT32 → no collision.
    expect(allowlistHook!.hookConfig.entityId).toBe(entityId);
    expect(erc20Hook!.hookConfig.entityId).toBe(entityId + HALF_UINT32);
  });

  /* -------------------------------------------------------------------------- */
  /*                                  Utilities                                 */
  /* -------------------------------------------------------------------------- */

  const givenConnectedProvider = async ({
    signer,
    accountAddress,
    factoryArgs,
    deferredAction,
  }: {
    signer: LocalAccount;
    accountAddress?: Address;
    deferredAction?: Hex;
    factoryArgs?: {
      factory?: Address;
      factoryData?: Hex;
    };
  }) => {
    const account = await toModularAccountV2({
      client: createPublicClient({
        transport: custom(localInstance.getClient().transport),
        chain: localInstance.chain,
      }),
      owner: signer,
      accountAddress,
      deferredAction,
      // If the account is not yet deployed & the signer is not the root owner, the
      // factoryAddress & factoryData must be provided, since they are deterministic
      // based on the original signer.
      factory: factoryArgs?.factory,
      factoryData: factoryArgs?.factoryData,
    });

    return createBundlerClient({
      account,
      transport: custom(localInstance.getClient().transport),
      chain: localInstance.chain,
      userOperation: {
        estimateFeesPerGas,
      },
    });
  };

  /**
   * Creates a sample ERC20 allowance permission
   *
   * @param {Address} tokenAddress The address of the ERC20 token contract
   * @param {string|number} allowance The allowance amount in wei (as a string or number)
   * @returns {Permission} An ERC20_TOKEN_TRANSFER permission
   */
  function createERC20TokenTransferPermission(
    tokenAddress: Address = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC on Ethereum mainnet
    allowance: string | number = "1000000000", // 1,000 USDC with 6 decimals
  ): Permission {
    return {
      type: PermissionType.ERC20_TOKEN_TRANSFER,
      data: {
        address: tokenAddress,
        allowance: toHex(BigInt(allowance)),
      },
    };
  }

  /**
   * Creates a sample native token transfer permission
   *
   * @param {string|number} allowance The allowance amount in wei (as a string or number)
   * @returns {Permission} A NATIVE_TOKEN_TRANSFER permission
   */
  function createNativeTokenTransferPermission(
    allowance: string | number = "1000000000000000000", // 1 ETH
  ): Permission {
    return {
      type: PermissionType.NATIVE_TOKEN_TRANSFER,
      data: {
        allowance: toHex(BigInt(allowance)),
      },
    };
  }

  /**
   * Creates a sample gas limit permission
   *
   * @param {string|number} limit The gas limit (as a string or number)
   * @returns {Permission} A GAS_LIMIT permission
   */
  function createGasLimitPermission(
    limit: string | number = "100000", // 100k gas
  ): Permission {
    return {
      type: PermissionType.GAS_LIMIT,
      data: {
        limit: toHex(BigInt(limit)),
      },
    };
  }

  /**
   * Creates a sample contract access permission
   *
   * @param {Address} contractAddress The address of the contract to allow access to
   * @returns {Permission} A CONTRACT_ACCESS permission
   */
  function createContractAccessPermission(
    contractAddress: Address = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", // Uniswap on Ethereum mainnet
  ): Permission {
    return {
      type: PermissionType.CONTRACT_ACCESS,
      data: {
        address: contractAddress,
      },
    };
  }

  /**
   * Creates a sample account functions permission
   *
   * @param {Hex[]} functionSignatures Array of function signature hexes
   * @returns {Permission} An ACCOUNT_FUNCTIONS permission
   */
  function createAccountFunctionsPermission(
    functionSignatures: Hex[] = [
      "0x095ea7b3", // approve(address,uint256)
      "0xa9059cbb", // transfer(address,uint256)
      "0x23b872dd", // transferFrom(address,address,uint256)
    ],
  ): Permission {
    return {
      type: PermissionType.ACCOUNT_FUNCTIONS,
      data: {
        functions: functionSignatures,
      },
    };
  }

  /**
   * Creates a sample functions on all contracts permission
   *
   * @param {Hex[]} functionSignatures Array of function signature hexes
   * @returns {Permission} A FUNCTIONS_ON_ALL_CONTRACTS permission
   */
  function createFunctionsOnAllContractsPermission(
    functionSignatures: Hex[] = [
      "0x095ea7b3", // approve(address,uint256)
      "0xa9059cbb", // transfer(address,uint256)
    ],
  ): Permission {
    return {
      type: PermissionType.FUNCTIONS_ON_ALL_CONTRACTS,
      data: {
        functions: functionSignatures,
      },
    };
  }

  /**
   * Creates a sample functions on specific contract permission
   *
   * @param {Address} contractAddress The address of the contract
   * @param {Hex[]} functionSignatures Array of function signature hexes
   * @returns {Permission} A FUNCTIONS_ON_CONTRACT permission
   */
  function createFunctionsOnContractPermission(
    contractAddress: Address = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", // Uniswap on Ethereum mainnet
    functionSignatures: Hex[] = [
      "0x7ff36ab5", // swapExactETHForTokens
      "0x18cbafe5", // swapExactTokensForETH
    ],
  ): Permission {
    return {
      type: PermissionType.FUNCTIONS_ON_CONTRACT,
      data: {
        address: contractAddress,
        functions: functionSignatures,
      },
    };
  }

  /**
   * Creates a root permission
   *
   * @returns {Permission} A ROOT permission
   */
  function createRootPermission(): Permission {
    return {
      type: PermissionType.ROOT,
    };
  }

  /**
   * Generates one of each permission type
   *
   * @returns {Permission[]} An array containing one of each permission type
   */
  function generateAllPermissions(): Permission[] {
    return [
      createNativeTokenTransferPermission(),
      createERC20TokenTransferPermission(),
      createGasLimitPermission(),
      createContractAccessPermission(),
      createAccountFunctionsPermission(),
      createFunctionsOnAllContractsPermission(),
      createFunctionsOnContractPermission(),
      createRootPermission(),
    ];
  }
});
