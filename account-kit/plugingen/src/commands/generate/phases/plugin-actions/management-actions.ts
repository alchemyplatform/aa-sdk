import { kebabCase } from "change-case";
import dedent from "dedent";
import type { PluginConfig } from "../../../../config";
import type { Phase, PhaseInput } from "../../types";

export const ManagementActionsGenPhase: Phase = async (input) => {
  const { addImport, pluginConfig, addType } = input;
  if (pluginConfig.installConfig != null) {
    addImports(
      addImport,
      pluginConfig.installConfig.dependencies?.map((x) => x.plugin) ?? []
    );

    const initArgs = pluginConfig.installConfig.initAbiParams ?? [];

    addType("InstallArgs", JSON.stringify(initArgs));
    addType(
      `Install${pluginConfig.name}Params`,
      dedent`{
        args: Parameters<typeof encodeAbiParameters<InstallArgs>>[1];
        pluginAddress?: Address;
        dependencyOverrides?: FunctionReference[];
    }`,
      true
    );
    addType(
      `ManagementActions<
        TAccount extends SmartContractAccount | undefined = SmartContractAccount | undefined,
        TContext extends UserOperationContext | undefined = Record<string,any> | undefined,
        TEntryPointVersion extends GetEntryPointFromAccount<TAccount> = GetEntryPointFromAccount<TAccount>
      >`,
      dedent`{
      install${pluginConfig.name}: (args:
        UserOperationOverridesParameter<TEntryPointVersion> &
        Install${pluginConfig.name}Params & GetAccountParameter<TAccount> & GetContextParameter<TContext>) =>
          Promise<SendUserOperationResult<TEntryPointVersion>>
    }`
    );

    const dependencies = (pluginConfig.installConfig.dependencies ?? []).map(
      (x) => dedent`
        (() => {
          const pluginAddress = ${x.plugin.name}.meta.addresses[chain.id];
          if (!pluginAddress) {
            throw new Error("missing ${x.plugin.name} address for chain " + chain.name);
          }

          return encodePacked(
            ["address", "uint8"],
            [pluginAddress, ${x.functionId}]
          );
        })()
      `
    );

    const installMethodName = `install${pluginConfig.name}`;

    input.content.push(dedent`
    ${installMethodName}({account = client.account, overrides, context, ...params}) {
      if (!account) {
        throw new AccountNotFoundError();
      }

      if (!isSmartAccountClient(client)) {
        throw new IncompatibleClientError("SmartAccountClient", "${installMethodName}", client);
      }

      const chain = client.chain;
      if (!chain) {
        throw new ChainNotFoundError();
      }

      const dependencies = params.dependencyOverrides ?? [${dependencies.join(
        ",\n\n"
      )}];
      const pluginAddress = params.pluginAddress ?? ${
        pluginConfig.name
      }.meta.addresses[chain.id] as Address | undefined;

      if (!pluginAddress) {
        throw new Error("missing ${
          pluginConfig.name
        } address for chain " + chain.name);
      }

      return installPlugin_(client, {
        pluginAddress,
        pluginInitData: encodeAbiParameters(${JSON.stringify(
          initArgs
        )}, params.args),
        dependencies,
        overrides,
        account,
        context,
      });
    }
  `);
  }

  return input;
};

const addImports = (
  addImport: PhaseInput["addImport"],
  deps?: PluginConfig[]
) => {
  if (deps != null && deps.length > 0) {
    addImport("viem", { name: "encodePacked" });
    deps.forEach((x) => {
      addImport(
        `../${kebabCase(x.name.replaceAll(/[pP]lugin/g, ""))}/plugin.js`,
        {
          name: x.name,
        }
      );
    });
  }

  addImport("@aa-sdk/core", { name: "ChainNotFoundError" });
  addImport("viem", { name: "encodeAbiParameters" });
  addImport("@account-kit/smart-contracts", {
    name: "installPlugin as installPlugin_",
  });
  addImport("@aa-sdk/core", {
    name: "GetAccountParameter",
    isType: true,
  });
  addImport("@aa-sdk/core", {
    name: "GetEntryPointFromAccount",
    isType: true,
  });
  addImport("@aa-sdk/core", {
    name: "UserOperationContext",
    isType: true,
  });
  addImport("@account-kit/smart-contracts", {
    name: "FunctionReference",
    isType: true,
  });
  addImport("@aa-sdk/core", { name: "GetContextParameter", isType: true });
};
