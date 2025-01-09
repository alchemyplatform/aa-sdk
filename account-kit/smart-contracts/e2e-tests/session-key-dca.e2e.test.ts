import { LocalAccountSigner } from "@aa-sdk/core";
import { erc7677Middleware, type SmartAccountSigner } from "@aa-sdk/core";
import {
  custom,
  parseEther,
  publicActions,
  zeroAddress,
  getContract,
  hashMessage,
  hashTypedData,
} from "viem";
import {
  createSMAV2AccountClient,
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
} from "@account-kit/smart-contracts";
import { local070Instance } from "~test/instances.js";
import { setBalance } from "viem/actions";
import { accounts } from "~test/constants.js";
import { paymaster070 } from "~test/paymaster/paymaster070.js";
import { HookType } from "../src/ma-v2/actions/common/types.js";

describe("Session Key DCA ", async () => {
  const instance = local070Instance;

  let client: ReturnType<typeof instance.getClient> &
    ReturnType<typeof publicActions>;

  beforeAll(async () => {
    client = instance.getClient().extend(publicActions);
    // todo: etch addresses or deploy them and update the fork block
  });

  const signer: SmartAccountSigner = new LocalAccountSigner(
    accounts.fundedAccountOwner
  );

  const sessionKey: SmartAccountSigner = new LocalAccountSigner(
    accounts.unfundedAccountOwner
  );

  it.only("adds a session key with set permissions", async () => {
    const entityId = 1;

    let provider = (
      await createSMAV2AccountClient({
        chain: instance.chain,
        signer,
        accountAddress: undefined,
        transport: custom(instance.getClient()),
        ...erc7677Middleware(),
      })
    ).extend(installValidationActions);

    await setBalance(client, {
      address: provider.getAddress(),
      value: parseEther("2"),
    });

    // temp placeholder target
    const target = zeroAddress;

    const allowlistHook = AllowlistModule.buildHook(
      {
        entityId,
        inputs: [
          {
            target,
            hasSelectorAllowlist: false, //todo: make true, add swap selector
            hasERC20SpendLimit: false,
            erc20SpendLimit: 0n,
            selectors: [],
          },
        ],
      },
      getDefaultAllowlistModuleAddress(provider.chain)
    );

    const timeRangeHook = TimeRangeModule.buildHook(
      {
        entityId,
        validUntil: 10000000000,
        validAfter: 0,
      },
      getDefaultTimeRangeModuleAddress(provider.chain)
    );

    let result = await provider.installValidation({
      validationConfig: {
        moduleAddress: getDefaultSingleSignerValidationModuleAddress(
          provider.chain
        ),
        entityId,
        isGlobal: true,
        isSignatureValidation: true,
        isUserOpValidation: true,
      },
      selectors: [],
      installData: SingleSignerValidationModule.encodeOnInstallData({
        entityId,
        signer: await sessionKey.getAddress(),
      }),
      hooks: [allowlistHook, timeRangeHook],
    });

    await provider.waitForUserOperationTransaction(result);

    // connect session key and send tx with session key
    // let sessionKeyClient = await createSMAV2AccountClient({
    //   chain: instance.chain,
    //   signer: sessionKey,
    //   transport: custom(instance.getClient()),
    //   accountAddress: provider.getAddress(),
    //   signerEntity: { entityId: 1, isGlobalValidation: true },
    // });
  });
});
