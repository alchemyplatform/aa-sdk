import dotenv from "dotenv";
import fetch from "node-fetch";
import { reset, setAutomine } from "viem/actions";
import { beforeAll } from "vitest";
import * as instances from "./src/instances.js";
import { paymaster060 } from "./src/paymaster/paymaster060.js";
import { paymaster070 } from "./src/paymaster/paymaster070.js";

dotenv.config();

// @ts-expect-error this does exist but ts is not liking it
global.fetch = fetch;

beforeAll(async () => {
  const client = instances.localInstance.getClient();
  await setAutomine(client, true);
  await paymaster060.deployPaymasterContract(client);
  await paymaster070.deployPaymasterContract(client);
}, 60_000);

afterEach(() => {
  onTestFailed(async () => {
    console.log(await instances.localInstance.getLogs("anvil"));
    console.log(await instances.localInstance.getLogs("bundler"));
    await instances.localInstance.restart();
  });
});

afterAll(async () => {
  const client = instances.localInstance.getClient();
  await instances.localInstance.restart();
  await reset(client);
});
