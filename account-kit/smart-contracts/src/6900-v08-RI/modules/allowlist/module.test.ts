import {
  custom,
  keccak256,
  parseEther,
  publicActions,
  toHex,
  type Address,
  type Hex,
  type PrivateKeyAccount,
  type CustomTransport,
  type Chain,
  type PublicActions,
  parseAbiItem,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

import {
  LocalAccountSigner,
  type SmartAccountSigner,
  type SmartAccountClient,
  type SmartContractAccount,
} from "@aa-sdk/core";

import {
  createSingleSignerRIAccountClient,
  installValidationActions,
  SingleSignerValidationModule,
  AllowlistModule,
  HookType,
  type SingleSignerRIAccount,
  type InstallValidationActions,
} from "@account-kit/smart-contracts";

import { local070InstanceArbSep } from "~test/instances.js";
import { setBalance } from "viem/actions";
import { accounts } from "~test/constants.js";

describe("AllowlistModule Tests", async () => {
  const instance = local070InstanceArbSep;

  const signer: SmartAccountSigner = new LocalAccountSigner(
    accounts.fundedAccountOwner
  );

  const allowlistInit: {
    target: Address;
    hasSelectorAllowlist: boolean;
    selectors: Hex[];
  }[] = [
    {
      target: "0x000000000000000000000000000000000000dEaD",
      hasSelectorAllowlist: true,
      selectors: ["0x1f1f1f1f", "0x2f2f2f2f"],
    },
    {
      target: "0x00000000000000000000000000000000dEadDEaD",
      hasSelectorAllowlist: false,
      selectors: [],
    },
  ];

  const addrNotOnAllowlist = "0x0000000000000000000000000000deadDEaDdeAd";

  const validationEntityId = 1;
  const hookEntityId = 0;

  // test cases:
  // - install
  // - uninstall
  // - execute from allowlist and selector list, succeeds
  // - execute from allowlist and not on selector list, fails
  // - execute from allowlist, not checking selectors, succeeds
  // - execute not on allowlist, fails
  // - able to uninstall, then execute fails

  it("should install correctly and initialize", async () => {
    installAndInitialize(0);
  });

  it("should successfully uninstall", async () => {
    const [provider] = await installAndInitialize(1);

    const result = await provider.uninstallValidation({
      args: {
        moduleAddress: SingleSignerValidationModule.meta.addresses.default,
        entityId: validationEntityId,
        uninstallData: SingleSignerValidationModule.encodeOnUninstallData({
          entityId: validationEntityId,
        }),
        hookUninstallDatas: [
          AllowlistModule.encodeOnUninstallData({
            entityId: hookEntityId,
            allowlistInit,
          }),
        ],
      },
    });

    const txnHash = provider.waitForUserOperationTransaction(result);

    await expect(txnHash).resolves.not.toThrowError();

    // Check event to make sure onUninstall succeeded

    const eventAbi = parseAbiItem(
      "event ValidationUninstalled(address indexed module, uint32 indexed entityId, bool onUninstallSucceeded)"
    );

    const logs = await provider.getLogs({
      address: provider.getAddress(),
      event: eventAbi,
      args: {
        module: SingleSignerValidationModule.meta.addresses.default,
        entityId: validationEntityId,
      },
    });

    expect(logs.length).toEqual(1);

    expect(logs[0].args.onUninstallSucceeded).toEqual(true);
  });

  it("should execute successfully from allowlist and selector list", async () => {
    const [provider, secondarySigner] = await installAndInitialize(2);

    const secondarySignerProvider = await createSingleSignerRIAccountClient({
      chain: instance.chain,
      signer: secondarySigner,
      accountAddress: provider.getAddress(),
      entityId: validationEntityId,
      transport: custom(instance.getClient()),
    });

    await executeAndCheck({
      provider: secondarySignerProvider,
      target: allowlistInit[0].target,
      data: allowlistInit[0].selectors[0],
      expectSuccess: true,
    });
  });

  it("should fail to execute from allowlist and not on selector list", async () => {
    const [provider, secondarySigner] = await installAndInitialize(3);

    const secondarySignerProvider = await createSingleSignerRIAccountClient({
      chain: instance.chain,
      signer: secondarySigner,
      accountAddress: provider.getAddress(),
      entityId: validationEntityId,
      transport: custom(instance.getClient()),
    });

    await executeAndCheck({
      provider: secondarySignerProvider,
      target: allowlistInit[0].target,
      data: "0x12345678",
      expectSuccess: false,
    });
  });

  it("should execute successfully from allowlist, not checking selectors", async () => {
    const [provider, secondarySigner] = await installAndInitialize(4);

    const secondarySignerProvider = await createSingleSignerRIAccountClient({
      chain: instance.chain,
      signer: secondarySigner,
      accountAddress: provider.getAddress(),
      entityId: validationEntityId,
      transport: custom(instance.getClient()),
    });

    await executeAndCheck({
      provider: secondarySignerProvider,
      target: allowlistInit[1].target,
      data: "0x12345678",
      expectSuccess: true,
    });
  });

  it("should fail to execute not on allowlist", async () => {
    const [provider, secondarySigner] = await installAndInitialize(5);

    const secondarySignerProvider = await createSingleSignerRIAccountClient({
      chain: instance.chain,
      signer: secondarySigner,
      accountAddress: provider.getAddress(),
      entityId: validationEntityId,
      transport: custom(instance.getClient()),
    });

    await executeAndCheck({
      provider: secondarySignerProvider,
      target: addrNotOnAllowlist,
      data: "0x12345678",
      expectSuccess: false,
    });
  });

  it("should fail to execute after uninstalling the secondary signer", async () => {
    const [provider, secondarySigner] = await installAndInitialize(6);

    const secondarySignerProvider = await createSingleSignerRIAccountClient({
      chain: instance.chain,
      signer: secondarySigner,
      accountAddress: provider.getAddress(),
      entityId: validationEntityId,
      transport: custom(instance.getClient()),
    });

    const result = await provider.uninstallValidation({
      args: {
        moduleAddress: SingleSignerValidationModule.meta.addresses.default,
        entityId: validationEntityId,
        uninstallData: SingleSignerValidationModule.encodeOnUninstallData({
          entityId: validationEntityId,
        }),
        hookUninstallDatas: [], // Intentionally don't call onUninstall
      },
    });

    const txnHash = provider.waitForUserOperationTransaction(result);

    await expect(txnHash).resolves.not.toThrowError();

    await executeAndCheck({
      provider: secondarySignerProvider,
      target: allowlistInit[0].target,
      data: allowlistInit[0].selectors[0],
      expectSuccess: false,
    });
  });

  const installAndInitialize = async (
    accountIndex: number
  ): Promise<
    [
      SmartAccountClient<
        CustomTransport,
        Chain,
        SingleSignerRIAccount<
          SmartAccountSigner<LocalAccountSigner<PrivateKeyAccount>>
        >
      > &
        InstallValidationActions<SmartContractAccount> &
        PublicActions,
      LocalAccountSigner<PrivateKeyAccount>
    ]
  > => {
    // Generate a secondary signer to add with the allowlist enforcing permissions over it

    const secondarySigner = new LocalAccountSigner(
      privateKeyToAccount(keccak256(toHex("secondarySigner")))
    );

    const provider = (
      await createSingleSignerRIAccountClient({
        chain: instance.chain,
        signer,
        salt: BigInt(accountIndex),
        transport: custom(instance.getClient()),
      })
    )
      .extend(installValidationActions)
      .extend(publicActions);

    await setBalance(instance.getClient(), {
      address: provider.getAddress(),
      value: parseEther("2"),
    });

    const result1 = await provider.installValidation({
      args: {
        validationConfig: {
          moduleAddress: SingleSignerValidationModule.meta.addresses.default,
          entityId: validationEntityId,
          isGlobal: true,
          isSignatureValidation: true,
        },
        selectors: [],
        installData: SingleSignerValidationModule.encodeOnInstallData({
          entityId: 1,
          signer: await secondarySigner.getAddress(),
        }),
        hooks: [
          {
            hookConfig: {
              moduleAddress: AllowlistModule.meta.addresses.default,
              entityId: hookEntityId,
              hookType: HookType.VALIDATION,
              hasPreHooks: false,
              hasPostHooks: false,
            },
            initData: AllowlistModule.encodeOnInstallData({
              entityId: hookEntityId,
              allowlistInit,
            }),
          },
        ],
      },
    });

    const txnHash1 = provider.waitForUserOperationTransaction(result1);

    await expect(txnHash1).resolves.not.toThrowError();

    return [provider, secondarySigner];
  };

  const executeAndCheck = async (args: {
    provider: SmartAccountClient<
      CustomTransport,
      Chain,
      SingleSignerRIAccount<SmartAccountSigner<unknown>>
    >;
    target: Address;
    data: Hex;
    expectSuccess: boolean;
  }) => {
    const { provider, target, data, expectSuccess } = args;

    const result = provider.sendUserOperation({
      uo: {
        target,
        data,
      },
    });

    if (expectSuccess) {
      const txnHash = provider.waitForUserOperationTransaction(await result);

      await expect(txnHash).resolves.not.toThrowError();
    } else {
      await expect(result).rejects.toThrowError();
    }
  };
});
