import { join } from "path";

export const rundlerBinaryPath = join(__dirname, "../bin/rundler");

export const poolId = Number(process.env.VITEST_POOL_ID ?? 1);
