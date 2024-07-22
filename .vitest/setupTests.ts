import dotenv from "dotenv";
import fetch from "node-fetch";
import { setIntervalMining } from "viem/actions";
import { afterAll, beforeAll } from "vitest";
import * as instances from "./src/instances.js";

const client = instances.anvilArbSepolia.getClient();

dotenv.config();

// @ts-expect-error this does exist but ts is not liking it
global.fetch = fetch;

beforeAll(async () => {
  await setIntervalMining(client, { interval: 0 });
}, 20_000);

afterAll(async () => {});
