import { execSync } from "child_process";

export interface FoundryCheckResult {
  isInstalled: boolean;
  anvilVersion?: string;
  rundlerBinaryPath?: string;
  error?: string;
}

export function checkFoundryInstallation(
  rundlerBinary?: string,
): FoundryCheckResult {
  try {
    // Check anvil installation
    const anvilVersion = execSync("anvil --version", {
      encoding: "utf-8",
      timeout: 5000,
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();

    // Check rundler binary if provided
    let rundlerBinaryPath: string | undefined;
    if (rundlerBinary) {
      try {
        execSync(`${rundlerBinary} --version`, {
          encoding: "utf-8",
          timeout: 5000,
          stdio: ["ignore", "pipe", "ignore"],
        });
        rundlerBinaryPath = rundlerBinary;
      } catch {
        // Rundler check failed but anvil is available
      }
    }

    return {
      isInstalled: true,
      anvilVersion,
      rundlerBinaryPath,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      isInstalled: false,
      error: errorMessage,
    };
  }
}
