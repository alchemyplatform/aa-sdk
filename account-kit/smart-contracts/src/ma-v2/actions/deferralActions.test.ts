import {
  erc7677Middleware,
  LocalAccountSigner,
  type SmartAccountSigner,
} from "@aa-sdk/core";
import {
  custom,
  parseEther,
  publicActions,
  testActions,
  type TestActions,
} from "viem";
import { installValidationActions } from "@account-kit/smart-contracts/experimental";
import {
  // createModularAccountV2Client,
  type SignerEntity,
} from "@account-kit/smart-contracts";
import { local070Instance } from "~test/instances.js";
import { setBalance } from "viem/actions";
import { accounts } from "~test/constants.js";
import { alchemyGasAndPaymasterAndDataMiddleware } from "@account-kit/infra";
import { deferralActions } from "./deferralActions.js";
import { PermissionBuilder, PermissionType } from "../permissionBuilder.js";
import { createModularAccountV2Client } from "../client/client.js";

// Note: These tests maintain a shared state to not break the local-running rundler by desyncing the chain.
describe("MA v2 deferral actions tests", async () => {
  const instance = local070Instance;

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

  const target = "0x000000000000000000000000000000000000dEaD";
  const sendAmount = parseEther("1");

  it("tests the full deferred actions flow", async () => {
    const provider = (await givenConnectedProvider({ signer }))
      .extend(deferralActions)
      .extend(installValidationActions);

    await setBalance(instance.getClient(), {
      address: provider.getAddress(),
      value: parseEther("2"),
    });

    const sessionKeyEntityId = 1;
    const sessionKey: SmartAccountSigner = new LocalAccountSigner(
      accounts.unfundedAccountOwner
    );

    // these can be default values or from call arguments
    const { entityId, nonce } = await provider.getEntityIdAndNonce({
      entityId: 0,
      nonceKey: 0n,
      isGlobalValidation: true,
    });

    // TODO: remove nonce override here
    const { typedData, hasAssociatedExecHooks } = await new PermissionBuilder(
      provider
    )
      .configure({
        key: {
          publicKey: await sessionKey.getAddress(),
          type: "secp256k1",
        },
        entityId,
        nonceKeyOverride: 0n, // TODO: add nonce override here
      })
      .addPermission({
        permission: {
          type: PermissionType.ROOT,
        },
      })
      .compile_deferred({
        deadline: 0,
        uoValidationEntityId: entityId,
        uoIsGlobalValidation: true,
      });

    const sig = await provider.account.signTypedData(typedData);

    const deferredActionDigest = await provider.buildDeferredActionDigest({
      typedData,
      sig,
    });

    // TODO: need nonce, orig account address, orig account initcode, signer entity
    const sessionKeyClient = await createModularAccountV2Client({
      transport: custom(instance.getClient()),
      chain: instance.chain,
      accountAddress: provider.getAddress(),
      signer: sessionKey,
      signerEntity: { isGlobalValidation: true, entityId: sessionKeyEntityId },
      initCode: provider.account.getInitCode(),
      deferredAction: {
        data: deferredActionDigest,
        nonce,
        hasAssociatedExecHooks,
      },
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
});
