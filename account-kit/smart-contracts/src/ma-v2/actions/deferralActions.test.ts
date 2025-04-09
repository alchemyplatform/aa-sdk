import {
  erc7677Middleware,
  LocalAccountSigner,
  type SmartAccountSigner,
} from "@aa-sdk/core";
import { custom, parseEther, toHex, type Address, type Hex } from "viem";
import {
  createModularAccountV2Client,
  type SignerEntity,
} from "@account-kit/smart-contracts";
import {
  buildDeferredActionDigest,
  deferralActions,
  PermissionBuilder,
  PermissionType,
  RootPermissionOnlyError,
  type Permission,
} from "@account-kit/smart-contracts/experimental";
import { local070Instance } from "~test/instances.js";
import { setBalance } from "viem/actions";
import { accounts } from "~test/constants.js";
import { alchemyGasAndPaymasterAndDataMiddleware } from "@account-kit/infra";

// Note: These tests maintain a shared state to not break the local-running rundler by desyncing the chain.
describe("MA v2 deferral actions tests", async () => {
  const instance = local070Instance;

  const signer: SmartAccountSigner = new LocalAccountSigner(
    accounts.fundedAccountOwner
  );

  const target = "0x000000000000000000000000000000000000dEaD";
  const sendAmount = parseEther("1");

  it("tests the full deferred actions flow", async () => {
    const provider = await givenConnectedProvider({ signer });

    const serverClient = (
      await createModularAccountV2Client({
        chain: instance.chain,
        accountAddress: provider.getAddress(),
        signer: new LocalAccountSigner(accounts.fundedAccountOwner),
        transport: custom(instance.getClient()),
      })
    ).extend(deferralActions);

    await setBalance(instance.getClient(), {
      address: provider.getAddress(),
      value: parseEther("2"),
    });

    const sessionKey: SmartAccountSigner = new LocalAccountSigner(
      accounts.unfundedAccountOwner
    );

    // these can be default values or from call arguments
    const { entityId, nonce } = await serverClient.getEntityIdAndNonce({
      isGlobalValidation: true,
    });

    const { typedData, fullPreSignatureDeferredActionDigest } =
      await new PermissionBuilder({
        client: serverClient,
        key: {
          publicKey: await sessionKey.getAddress(),
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
        .compileDeferred();

    const sig = await provider.account.signTypedData(typedData);

    const deferredActionDigest = buildDeferredActionDigest({
      fullPreSignatureDeferredActionDigest,
      sig,
    });

    const sessionKeyClient = await createModularAccountV2Client({
      transport: custom(instance.getClient()),
      chain: instance.chain,
      accountAddress: provider.getAddress(),
      signer: sessionKey,
      initCode: await provider.account.getInitCode(),
      deferredAction: deferredActionDigest,
    });

    const uoResult = await sessionKeyClient.sendUserOperation({
      uo: {
        target: target,
        value: sendAmount,
        data: "0x",
      },
    });

    await provider.waitForUserOperationTransaction(uoResult);
  });

  it("PermissionBuilder: Cannot add any permission after root", async () => {
    const provider = await givenConnectedProvider({ signer });

    const serverClient = (
      await createModularAccountV2Client({
        chain: instance.chain,
        accountAddress: provider.getAddress(),
        signer: new LocalAccountSigner(accounts.fundedAccountOwner),
        transport: custom(instance.getClient()),
      })
    ).extend(deferralActions);

    await setBalance(instance.getClient(), {
      address: provider.getAddress(),
      value: parseEther("2"),
    });

    const sessionKey: SmartAccountSigner = new LocalAccountSigner(
      accounts.unfundedAccountOwner
    );

    // these can be default values or from call arguments
    const { entityId, nonce } = await serverClient.getEntityIdAndNonce({
      isGlobalValidation: true,
    });

    const allPermissions = generateAllPermissions();

    allPermissions.forEach((permission) => {
      expect(async () => {
        new PermissionBuilder({
          client: serverClient,
          key: {
            publicKey: await sessionKey.getAddress(),
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

  it("PermissionBuilder: Cannot add root after any permission", async () => {
    const provider = await givenConnectedProvider({ signer });

    const serverClient = (
      await createModularAccountV2Client({
        chain: instance.chain,
        accountAddress: provider.getAddress(),
        signer: new LocalAccountSigner(accounts.fundedAccountOwner),
        transport: custom(instance.getClient()),
      })
    ).extend(deferralActions);

    await setBalance(instance.getClient(), {
      address: provider.getAddress(),
      value: parseEther("2"),
    });

    const sessionKey: SmartAccountSigner = new LocalAccountSigner(
      accounts.unfundedAccountOwner
    );

    // these can be default values or from call arguments
    const { entityId, nonce } = await serverClient.getEntityIdAndNonce({
      isGlobalValidation: true,
    });

    const allPermissions = generateAllPermissions();

    allPermissions.forEach((permission) => {
      expect(async () => {
        return new PermissionBuilder({
          client: serverClient,
          key: {
            publicKey: await sessionKey.getAddress(),
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
    signerEntity,
    accountAddress,
    paymasterMiddleware,
    salt = 0n,
  }: {
    signer: SmartAccountSigner;
    signerEntity?: SignerEntity;
    accountAddress?: `0x${string}`;
    paymasterMiddleware?: "alchemyGasAndPaymasterAndData" | "erc7677";
    salt?: bigint;
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
      salt,
    });

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
