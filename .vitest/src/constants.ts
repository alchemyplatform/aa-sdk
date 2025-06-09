import isCi from "is-ci";
import { join } from "path";
import { type Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";

export const rundlerBinaryPath = isCi
  ? "rundler"
  : join(__dirname, "../bin/rundler");

export const poolId = () => Number(process.env.VITEST_POOL_ID ?? 1);

export const create2deployer: Address =
  "0x4e59b44847b379578588920ca78fbf26c0b4956c";

export const accounts = {
  paymasterOwner: privateKeyToAccount(
    "0x83ee5e9712839dad9c44192aebeb01411d8b4c7577c64cb512ee128f00563578",
  ),
  unfundedAccountOwner: privateKeyToAccount(
    // some randomly generated private key
    "0x83ee5e9712839dad9c44192aebeb01411d8b4c7577c64cb512ee128f00563577",
  ),
  fundedAccountOwner: privateKeyToAccount(
    // this is a default private key used in anvil
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  ),
};

export const entrypoint060 = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
export const entrypoint070 = "0x0000000071727De22E5E9d8BAf0edAc6f37da032";
