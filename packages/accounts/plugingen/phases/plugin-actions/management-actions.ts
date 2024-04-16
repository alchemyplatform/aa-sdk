import { kebabCase } from "change-case";
import dedent from "dedent";
import type { PluginGenConfig } from "../../../plugindefs/types";
import type { Phase, PhaseInput } from "../../types";

export const ManagementActionsGenPhase: Phase = async (input) => {
  const { addImport, config, contract, addType } = input;
  if (config.installConfig != null) {
    addImports(
      addImport,
      config.installConfig.dependencies?.map((x) => x.plugin) ?? []
    );

    const initArgs = config.installConfig.initAbiParams ?? [];

    addType("InstallArgs", JSON.stringify(initArgs));
    addType(
      `Install${contract.name}Params`,
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
        TContext extends UserOperationContext | undefined = UserOperationContext | undefined,
        TEntryPointVersion extends GetEntryPointFromAccount<TAccount> = GetEntryPointFromAccount<TAccount>
      >`,
      dedent`{
        install${contract.name}: (args: UserOperationOverridesParameter<TEntryPointVersion> &
          Install${contract.name}Params & GetAccountParameter<TAccount> & GetContextParameter<TContext>) =>
            Promise<SendUserOperationResult<TEntryPointVersion>>
      }`
    );

    const dependencies = (config.installConfig.dependencies ?? []).map(
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

    const installMethodName = `install${contract.name}`;

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
        contract.name
      }.meta.addresses[chain.id] as Address | undefined;

      if (!pluginAddress) {
        throw new Error("missing ${
          contract.name
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
  deps?: PluginGenConfig[]
) => {
  if (deps != null && deps.length > 0) {
    addImport("viem", { name: "encodePacked" });
    deps.forEach((x) => {
      // TODO: after plugingen becomes its own cli tool package, this should be changed to
      // `addImport("@alchemy/aa-accounts", { name: x.name });`
      addImport(
        `../${kebabCase(x.name.replaceAll(/[pP]lugin/g, ""))}/plugin.js`,
        {
          name: x.name,
        }
      );
    });
  }

  addImport("@alchemy/aa-core", { name: "ChainNotFoundError" });
  addImport("viem", { name: "encodeAbiParameters" });
  // TODO: after plugingen becomes its own cli tool package, this should be changed to
  // `addImport("@alchemy/aa-accounts", { name: "installPlugin as installPlugin_" });`
  addImport("../../plugin-manager/installPlugin.js", {
    name: "installPlugin as installPlugin_",
  });
  addImport("@alchemy/aa-core", {
    name: "GetAccountParameter",
    isType: true,
  });
  addImport("@alchemy/aa-core", {
    name: "GetEntryPointFromAccount",
    isType: true,
  });
  addImport("@alchemy/aa-core", {
    name: "UserOperationContext",
    isType: true,
  });
  // TODO: after plugingen becomes its own cli tool package, this should be changed to
  // `addImport("@alchemy/aa-accounts", { name: "FunctionReference", isType: true });`
  addImport("../../account-loupe/types.js", {
    name: "FunctionReference",
    isType: true,
  });
  addImport("@alchemy/aa-core", { name: "GetContextParameter", isType: true });
};
