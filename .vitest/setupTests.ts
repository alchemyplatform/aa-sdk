import dotenv from "dotenv";
import fetch from "node-fetch";
import { setAutomine } from "viem/actions";
import { afterAll, beforeAll } from "vitest";
import * as instances from "./src/instances.js";
import { deployPaymasterContract } from "./src/paymaster.js";

dotenv.config();

// @ts-expect-error this does exist but ts is not liking it
global.fetch = fetch;

beforeAll(async () => {
  const client = instances.anvilArbSepolia.getClient();
  await setAutomine(client, true);
  await deployPaymasterContract(client);
}, 60_000);

afterAll(async () => {});
