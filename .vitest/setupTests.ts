import dotenv from "dotenv";
dotenv.config();

import fetch from "node-fetch";
import { setAutomine } from "viem/actions";
import { beforeAll } from "vitest";
import { poolId } from "./src/constants.js";
import { localInstance } from "./src/instances.js";
import { paymaster060 } from "./src/paymaster/paymaster060.js";
import { paymaster070 } from "./src/paymaster/paymaster070.js";

// @ts-expect-error this does exist but ts is not liking it
global.fetch = fetch;

beforeAll(async () => {
  const client = localInstance.getClient();
  await setAutomine(client, true);

  await paymaster060.deployPaymasterContract(client);
  await paymaster070.deployPaymasterContract(client);
}, 10_000);

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
