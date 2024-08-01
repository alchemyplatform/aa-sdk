import dotenv from "dotenv";
dotenv.config();

import fetch from "node-fetch";
import { setAutomine } from "viem/actions";
import { beforeAll } from "vitest";
import { poolId } from "./src/constants.js";
import {
  local060Instance,
  local070Instance,
  local070InstanceArbSep,
} from "./src/instances.js";
import { paymaster060 } from "./src/paymaster/paymaster060.js";
import { paymaster070 } from "./src/paymaster/paymaster070.js";

// @ts-expect-error this does exist but ts is not liking it
global.fetch = fetch;

beforeAll(async () => {
  const client060 = local060Instance.getClient();
  const client070 = local070Instance.getClient();
  const client070ArbSep = local070InstanceArbSep.getClient();

  await setAutomine(client060, true);
  await setAutomine(client070, true);
  await setAutomine(client070ArbSep, true);

  await paymaster060.deployPaymasterContract(client060);
  await paymaster070.deployPaymasterContract(client070);
}, 60_000);

afterEach(() => {
  onTestFailed(async () => {
    console.log(`Logs for failed test [${poolId()}]:`);
    console.log(await local060Instance.getLogs("anvil"));
    console.log(await local060Instance.getLogs("bundler"));

    console.log(await local070Instance.getLogs("anvil"));
    console.log(await local070Instance.getLogs("bundler"));

    console.log(await local070InstanceArbSep.getLogs("anvil"));
    console.log(await local070InstanceArbSep.getLogs("bundler"));
  });
});

afterAll(async () => {
  await local060Instance.restart();
  await local070Instance.restart();
  await local070InstanceArbSep.restart();
});
