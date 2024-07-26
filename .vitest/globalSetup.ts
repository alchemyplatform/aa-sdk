import { rundlerBinaryPath } from "./src/constants";
import * as instances from "./src/instances";
import {
  cleanupRundler,
  downloadLatestRundlerRelease,
  isRundlerInstalled,
} from "./src/rundler";

export default async function () {
  if (!(await isRundlerInstalled(rundlerBinaryPath))) {
    await downloadLatestRundlerRelease(rundlerBinaryPath);
  }

  const shutdown = await Promise.all(
    Object.values(instances).map(async (instance) => {
      const shutdown = instance.start();

      return shutdown;
    })
  );

  return async () => {
    await Promise.all(shutdown.map((stop) => stop()));
    await cleanupRundler(rundlerBinaryPath);
  };
}
