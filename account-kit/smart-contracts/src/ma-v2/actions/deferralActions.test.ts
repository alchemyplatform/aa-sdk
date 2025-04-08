import {
  erc7677Middleware,
  LocalAccountSigner,
  type SmartAccountSigner,
} from "@aa-sdk/core";
import { custom, parseEther } from "viem";
import {
  createModularAccountV2Client,
  type SignerEntity,
} from "@account-kit/smart-contracts";
import {
  deferralActions,
  PermissionBuilder,
  PermissionType,
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

    const deferredActionDigest = await serverClient.buildDeferredActionDigest({
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
