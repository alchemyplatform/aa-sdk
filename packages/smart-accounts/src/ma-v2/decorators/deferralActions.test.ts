import { bigIntMultiply } from "@aa-sdk/core";
import {
  concat,
  concatHex,
  createPublicClient,
  custom,
  isAddress,
  isHex,
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
import { getBlock } from "viem/actions";
import { local070Instance } from "~test/instances.js";
import {
  packAccountGasLimits,
  packPaymasterData,
} from "../../../../../aa-sdk/core/src/entrypoint/0.7"; // TODO(jh): remove v4 dep
import { toModularAccountV2 } from "../accounts/account.js";
import { deferralActions } from "./deferralActions.js";
import {
  PermissionBuilder,
  PermissionType,
  type Permission,
} from "../permissionBuilder.js";
import { RootPermissionOnlyError } from "../../errors/permissionBuilderErrors.js";
import { raise } from "@alchemy/common";
import { buildDeferredActionDigest } from "../utils/deferredActions.js";

// Note: These tests maintain a shared state to not break the local-running rundler by desyncing the chain.
describe("MA v2 deferral actions tests", async () => {
  const instance = local070Instance;

  const target = "0x000000000000000000000000000000000000dEaD";
  const sendAmount = parseEther("1");

  let owner: LocalAccount;
  let sessionKey: LocalAccount;
  let deferredActionDigest: Hex;
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

    await setBalance(instance.getClient(), {
      address: provider.account.address,
      value: parseEther("30"),
    });

    // these can be default values or from call arguments
    const { entityId, nonce } = await provider.getEntityIdAndNonce({
      isGlobalValidation: true,
    });

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
            type: PermissionType.ROOT,
          },
        })
        .compileDeferred();

    const sig = await owner.signTypedData(typedData);

    deferredActionDigest = buildDeferredActionDigest({
      fullPreSignatureDeferredActionDigest,
      sig,
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
        deferredAction: deferredActionDigest,
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

      await setNextBlockBaseFeePerGas(instance.getClient(), {
        baseFeePerGas: parseGwei("1"),
      });

      await mine(instance.getClient(), { blocks: 5 });

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

      await setNextBlockBaseFeePerGas(instance.getClient(), {
        baseFeePerGas: parseGwei("1"),
      });
      await mine(instance.getClient(), { blocks: 5 });

      await sessionKeyClient.waitForUserOperationReceipt({
        hash: hash2,
        timeout: 10_000,
      });
    }
  );

  it(
    "deferred action then send another uo from new client",
    { retry: 3, timeout: 30_000 },
    async () => {
      const sessionKeyClient = await givenConnectedProvider({
        signer: sessionKey,
        accountAddress,
        deferredAction: deferredActionDigest,
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

      await setNextBlockBaseFeePerGas(instance.getClient(), {
        baseFeePerGas: 10n,
      });

      await sessionKeyClient.waitForUserOperationReceipt({
        hash,
        timeout: 10_000,
      });

      const sessionKeyClient2 = await givenConnectedProvider({
        signer: sessionKey,
        accountAddress,
        deferredAction: deferredActionDigest,
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

      await setNextBlockBaseFeePerGas(instance.getClient(), {
        baseFeePerGas: 10n,
      });

      await sessionKeyClient2.waitForUserOperationReceipt({
        hash: hash2,
        timeout: 10_000,
      });
    }
  );

  it("PermissionBuilder: Cannot add any permission after root", async () => {
    const provider = await givenConnectedProvider({ signer: owner });

    await setBalance(instance.getClient(), {
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

    await setBalance(instance.getClient(), {
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
      /compileDeferred\(\): deadline \d+ cannot be before now \(\d+(\.\d+)?\)/
    );
  });

  it("PermissionBuilder: Cannot install expired deferred action", async () => {
    const client = instance
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

    const { typedData, fullPreSignatureDeferredActionDigest } =
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

    // Sign the typed data using the owner (fallback) validation, this must be done via the account to skip 6492
    const deferredValidationSig = await owner.signTypedData(typedData);

    // Build the full hex to prepend to the UO signature
    const deferredActionDigest = buildDeferredActionDigest({
      fullPreSignatureDeferredActionDigest,
      sig: deferredValidationSig,
    });

    // Initialize the session key client corresponding to the session key we will install in the deferred action
    const sessionKeyClient = await givenConnectedProvider({
      signer: sessionKey,
      accountAddress,
      deferredAction: deferredActionDigest,
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
                verificationGasLimit: toHex(signedUo.verificationGasLimit),
                callGasLimit: toHex(signedUo.callGasLimit),
              }),
              preVerificationGas: signedUo.preVerificationGas,
              gasFees: packAccountGasLimits({
                maxPriorityFeePerGas: toHex(signedUo.maxPriorityFeePerGas),
                maxFeePerGas: toHex(signedUo.maxFeePerGas),
              }),
              paymasterAndData:
                signedUo.paymaster && isAddress(signedUo.paymaster)
                  ? packPaymasterData({
                      paymaster: signedUo.paymaster,
                      paymasterVerificationGasLimit: toHex(
                        signedUo.paymasterVerificationGasLimit ?? 0
                      ),
                      paymasterPostOpGasLimit: toHex(
                        signedUo.paymasterPostOpGasLimit ?? 0
                      ),
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

    await setBalance(instance.getClient(), {
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
        })
      );
    });
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
        transport: custom(instance.getClient().transport),
        chain: instance.chain,
      }),
      owner: signer,
      accountAddress,
      deferredAction,
      // TODO(jh): this (fka initcode) is required if using a deferred action & the account isn't deployed yet.
      // TODO(jh): test that it is not required if the account is already deployed.
      factoryAddress: factoryArgs?.factory,
      factoryData: factoryArgs?.factoryData,
    });

    return createBundlerClient({
      account,
      transport: custom(instance.getClient().transport),
      chain: instance.chain,
      userOperation: {
        // TODO(jh): use the action trevor made in other pr once merged.
        estimateFeesPerGas: async ({ bundlerClient }) => {
          const [block, maxPriorityFeePerGasEstimate] = await Promise.all([
            getBlock(bundlerClient, { blockTag: "latest" }),
            bundlerClient.request({
              // @ts-ignore - this is fine.
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
    allowance: string | number = "1000000000" // 1,000 USDC with 6 decimals
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
    allowance: string | number = "1000000000000000000" // 1 ETH
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
    limit: string | number = "100000" // 100k gas
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
    contractAddress: Address = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984" // Uniswap on Ethereum mainnet
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
    ]
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
    ]
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
    ]
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
