import dotenv from "dotenv";
import { writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const writeInDev = process.env.WRITE_IN_DEV === "true";

if (writeInDev) {
  const targetFilePath = "dist/esm/_writeKey.js";
  writeFileSync(
    resolve(__dirname, targetFilePath),
    `
    export const WRITE_IN_DEV = ${writeInDev};
    `,
  );
}
