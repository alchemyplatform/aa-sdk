// https://github.com/wevm/wagmi/blob/main/packages/cli/src/utils/getIsUsingTypeScript.ts
import { findUp } from "find-up";

export async function getIsUsingTypeScript() {
  try {
    const cwd = process.cwd();
    const tsconfig = await findUp("tsconfig.json", { cwd });
    if (tsconfig) return true;

    const plugingenConfig = await findUp(
      ["plugingenConfig.config.ts", "plugingenConfig.config.mts"],
      {
        cwd,
      }
    );
    if (plugingenConfig) return true;

    return false;
  } catch {
    return false;
  }
}
