import path from "path";
import fetch from "node-fetch";
import fs from "fs";
import { fileURLToPath } from "url";
import { pipeline } from "stream";
import { promisify } from "util";
import zlib from "zlib";
import * as tar from "tar";
import * as logger from "./logger.js";

const streamPipeline = promisify(pipeline);

export const getRundlerBinaryPath = () => {
  const __filename = fileURLToPath(import.meta.url);
  const fileBinpath = path.resolve(__filename, "../..", `rundler`);

  return fileBinpath;
};

export async function isRundlerInstalled(rundlerPath: string) {
  try {
    await fs.promises.access(rundlerPath, fs.constants.F_OK);
    return true;
  } catch (e) {
    return false;
  }
}

export async function downloadLatestRelease(filePath: string) {
  const repoUrl = `https://api.github.com/repos/alchemyplatform/rundler/releases`;
  const { arch, platform } = process;
  const spinner = logger.spinner();

  try {
    spinner.start("Downloading latest rundler release");
    // Get the list of releases from GitHub API
    const releasesResponse = await fetch(repoUrl);
    if (!releasesResponse.ok) {
      throw new Error(
        `Failed to fetch releases: ${releasesResponse.statusText}`
      );
    }
    const releases: any = await releasesResponse.json();

    if (releases.length === 0) {
      spinner.warn("No releases found for this repository.");
      return;
    }

    // Get the latest release
    const latestRelease = releases[0];
    const asset = latestRelease.assets
      .filter((x: any) => (x.name as string).endsWith(".gz"))
      .find((x: any) => {
        return (
          x.name.includes(platform) &&
          (x.name.includes(arch) ||
            (arch === "arm64" &&
              platform === "darwin" &&
              x.name.includes("aarch64")))
        );
      });

    if (!asset) {
      spinner.warn("No assets found for the latest release.");
      return;
    }

    const assetUrl = asset.browser_download_url;

    // Download the asset
    const assetResponse = await fetch(assetUrl);
    if (!assetResponse.ok) {
      throw new Error(`Failed to download asset: ${assetResponse.statusText}`);
    }

    if (!assetResponse.body) {
      throw new Error("Github request returned an empty body");
    }

    // Save the downloaded file
    spinner.text = "Extracting the downloaded release";
    const extractPath = path.resolve(filePath, "..");
    const gunzipStream = zlib.createGunzip();
    const tarStream = tar.extract({
      cwd: extractPath,
    });
    await streamPipeline(assetResponse.body, gunzipStream, tarStream);

    spinner.succeed("Downloaded and extracted the latest release.");
  } catch (error) {
    spinner.fail(`Failed to download the latest release. ${error}`);
  }
}
