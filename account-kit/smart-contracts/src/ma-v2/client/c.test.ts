import { createModularAccountV2Client } from "@account-kit/smart-contracts";
import {
  HookType,
  installValidationActions,
  getDefaultSingleSignerValidationModuleAddress,
  SingleSignerValidationModule,
  getDefaultTimeRangeModuleAddress,
  TimeRangeModule,
} from "@account-kit/smart-contracts/experimental";
import { LocalAccountSigner } from "@aa-sdk/core";
import { sepolia, alchemy } from "@account-kit/infra";
import { generatePrivateKey } from "viem/accounts";
import { type SmartAccountSigner } from "@aa-sdk/core";

describe("MA v2 Tests", async () => {
  const client = (
    await createModularAccountV2Client({
      chain: sepolia,
      transport: alchemy({ apiKey: "your-api-key" }),
      signer: LocalAccountSigner.privateKeyToAccountSigner(
        generatePrivateKey()
      ),
    })
  ).extend(installValidationActions);

  let sessionKeyEntityId = 1;
  const ecdsaValidationModuleAddress =
    getDefaultSingleSignerValidationModuleAddress(client.chain);
  const sessionKeySigner: SmartAccountSigner =
    LocalAccountSigner.mnemonicToAccountSigner("SESSION_KEY_MNEMONIC");

  const hookEntityId = 0; // Make sure that the account does not have a hook with this entity id on the module yet
  const validAfter = Math.floor(Date.now() / 1000) + 86400; // validity starts 1 day from now
  const validUntil = validAfter + 86400; // validity ends 2 days from now

  // Adding a session key that starts in a day and expires in two days
  await client.installValidation({
    validationConfig: {
      moduleAddress: ecdsaValidationModuleAddress,
      entityId: sessionKeyEntityId,
      isGlobal: true,
      isSignatureValidation: true,
      isUserOpValidation: true,
    },
    selectors: [],
    installData: SingleSignerValidationModule.encodeOnInstallData({
      entityId: sessionKeyEntityId,
      signer: await sessionKeySigner.getAddress(), // Address of the session key
    }),
    hooks: [
      {
        hookConfig: {
          address: getDefaultTimeRangeModuleAddress(client.chain),
          entityId: hookEntityId,
          hookType: HookType.VALIDATION, // fixed value
          hasPreHooks: true, // fixed value
          hasPostHooks: false, // fixed value
        },
        initData: TimeRangeModule.encodeOnInstallData({
          entityId: hookEntityId,
          validAfter,
          validUntil,
        }),
      },
    ],
  });
});
