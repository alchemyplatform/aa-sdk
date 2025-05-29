import * as fs from "node:fs";
import * as path from "node:path";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import * as zlib from "node:zlib";
import * as tar from "tar";

const streamPipeline = promisify(pipeline);

export async function isRundlerInstalled(rundlerPath: string) {
  try {
    await fs.promises.access(rundlerPath, fs.constants.F_OK);
    return true;
  } catch (e) {
    return false;
  }
}

export async function cleanupRundler(rundlerPath: string) {
  await fs.promises.rm(rundlerPath, { force: true });
}

export async function downloadLatestRundlerRelease(
  filePath: string,
  version = "v0.8.2",
) {
  const repoUrl =
    "https://api.github.com/repos/alchemyplatform/rundler/releases";
  const { arch, platform } = process;

  try {
    // Get the list of releases from GitHub API
    const releasesResponse = await fetch(repoUrl);
    if (!releasesResponse.ok) {
      throw new Error(
        `Failed to fetch releases: ${releasesResponse.statusText}`,
      );
    }
    const releases: any = await releasesResponse.json();

    if (releases.length === 0) {
      return;
    }

    // Get the latest release
    const latestRelease = releases.find((x: any) => x.tag_name === version);
    if (!latestRelease) {
      throw new Error(`Failed to find release with tag ${version}`);
    }

    const asset = latestRelease.assets
      .filter((x: any) => (x.name as string).endsWith(".gz"))
      .find((x: any) => {
        return (
          x.name.includes(platform) &&
          (x.name.includes(arch) ||
            (arch === "arm64" &&
              platform === "darwin" &&
              x.name.includes("aarch64")) ||
            (arch === "x64" &&
              platform === "linux" &&
              x.name.includes("x86_64")))
        );
      });

    if (!asset) {
      throw new Error(
        `Failed to find a suitable asset for the current platform, ${JSON.stringify(
          { arch, platform, assets: latestRelease.assets },
          null,
          2,
        )}`,
      );
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
    const extractPath = path.resolve(filePath, "..");
    if (!(await isRundlerInstalled(extractPath))) {
      await fs.promises.mkdir(extractPath, { recursive: true });
    }

    const gunzipStream = zlib.createGunzip();
    const tarStream = tar.extract({
      cwd: extractPath,
    });
    await streamPipeline(assetResponse.body, gunzipStream, tarStream);
  } catch (error) {
    throw new Error(`Failed to download the latest release. ${error}`);
  }
}
