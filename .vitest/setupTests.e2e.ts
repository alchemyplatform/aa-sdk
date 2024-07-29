import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

// @ts-expect-error this does exist but ts is not liking it
global.fetch = fetch;
