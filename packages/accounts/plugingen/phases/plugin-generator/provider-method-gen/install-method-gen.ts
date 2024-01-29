import { kebabCase } from "change-case";
import dedent from "dedent";
import type { PluginGenConfig } from "../../../../plugindefs/types";
import type { Phase, PhaseInput } from "../../../types";

export const InstallMethodGenPhase: Phase = async (input) => {
  const { addImport, config, addType, contract } = input;
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
    install${contract.name}: (params: Install${
      contract.name
    }Params, overrides?: UserOperationOverrides) => {
      const chain = provider.rpcClient.chain;
      const dependencies = params.dependencyOverrides ?? [${dependencies.join(
        ",\n\n"
      )}];
      const pluginAddress = params.pluginAddress ?? ${
        contract.name
      }_.meta.addresses[chain.id] as Address | undefined;

      if (!pluginAddress) {
        throw new Error("missing ${
          contract.name
        } address for chain " + chain.name);
      }

      return installPlugin_(provider, {
        pluginAddress,
        pluginInitData: encodeAbiParameters(${JSON.stringify(
          initArgs
        )}, params.args),
        dependencies,
      }, overrides);
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
  addImport("../../account-loupe/types.js", {
    name: "FunctionReference",
    isType: true,
  });
};
