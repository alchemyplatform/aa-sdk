import {
  createRundler,
  downloadLatestRelease,
  getRundlerBinaryPath,
} from "./dist/esm/index.js";

await downloadLatestRelease(getRundlerBinaryPath());

const rundler = await createRundler();

await rundler.start();
