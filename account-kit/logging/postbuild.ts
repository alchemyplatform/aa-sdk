import dotenv from "dotenv";
import { writeFileSync } from "fs";
import isCi from "is-ci";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const writeKey = process.env.ANALYTICS_WRITE_KEY;
const writeInDev = process.env.WRITE_IN_DEV === "true";

if (writeKey) {
  const targetFilePath = "dist/esm/_writeKey.js";
  writeFileSync(
    resolve(__dirname, targetFilePath),
    `
    export const WRITE_KEY = "${writeKey}";
    export const WRITE_IN_DEV = ${writeInDev};
    `
  );
} else if (isCi) {
  console.warn(
    "In CI, you should specify a write key to ensure that the library is built to log events"
  );
}
