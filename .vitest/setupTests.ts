import dotenv from "dotenv";
import fetch from "node-fetch";
dotenv.config();

// @ts-expect-error wut
global.fetch = fetch;
