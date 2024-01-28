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
      "ManagementActions<TAccount extends SmartContractAccount | undefined = SmartContractAccount | undefined>",
      dedent`{
      install${contract.name}: (args: {overrides?: UserOperationOverrides} & Install${contract.name}Params & GetAccountParameter<TAccount>) => Promise<SendUserOperationResult>
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

    input.content.push(dedent`
    install${contract.name}({account = client.account, overrides, ...params}) {
      if (!account) {
        throw new Error("Account is required");
      }

      const chain = client.chain;
      if (!chain) {
        throw new Error("Chain is required");
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
      addImport(
        `../${kebabCase(x.name.replaceAll(/[pP]lugin/g, ""))}/plugin.js`,
        {
          name: x.name,
        }
      );
    });
  }

  addImport("viem", { name: "encodeAbiParameters" });
  addImport("../../plugin-manager/installPlugin.js", {
    name: "installPlugin as installPlugin_",
  });
  addImport("@alchemy/aa-core/viem", {
    name: "GetAccountParameter",
    isType: true,
  });
  addImport("../../account-loupe/types.js", {
    name: "FunctionReference",
    isType: true,
  });
};
