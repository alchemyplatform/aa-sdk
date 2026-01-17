import dotenv from "dotenv";
dotenv.config();

import fetch from "node-fetch";
import { setAutomine } from "viem/actions";
import { beforeAll } from "vitest";
import { poolId, rundlerBinaryPath } from "./src/constants.js";
import { localInstance } from "./src/instances.js";
import { paymaster060 } from "./src/paymaster/paymaster060.js";
import { paymaster070 } from "./src/paymaster/paymaster070.js";
import { paymaster080 } from "./src/paymaster/paymaster080.js";
import { checkFoundryInstallation } from "./src/utils/checkFoundryInstallation.js";

// @ts-expect-error this does exist but ts is not liking it
global.fetch = fetch;

beforeAll(async () => {
  const foundryCheck = checkFoundryInstallation(rundlerBinaryPath);
  if (!foundryCheck.isInstalled) {
    const baseMessage = `
    ❌ Foundry/Anvil is not properly installed or not in your PATH.
    Please see the README in .vitest/ for installation instructions.
    Error details: ${foundryCheck.error || "Unknown error"}
    `;

    throw new Error(baseMessage);
  }

  const client = localInstance.getClient();
  await setAutomine(client, true);

  await paymaster060.deployPaymasterContract(client);
  await paymaster070.deployPaymasterContract(client);
  await paymaster080.deployPaymasterContract(client);
  // TODO paymaster for v0.9
}, 60_000);

afterEach(() => {
  onTestFailed(async () => {
    console.log(`Logs for failed test [${poolId()}]:`);
    console.log(await localInstance.getLogs("anvil"));
    console.log(await localInstance.getLogs("bundler"));
  });
});

afterAll(async () => {
  await localInstance.restart();
});
