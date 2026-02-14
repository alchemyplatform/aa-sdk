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
export const entrypoint080 = "0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108";

/** Default Anvil private keys used as rundler builder/signer accounts. */
export const rundlerSignerKeys = [
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
  "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
  "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
  "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a",
  "0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba",
  "0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e",
  "0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356",
  "0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97",
  "0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6",
] as const;

export const rundlerSignerAddresses = rundlerSignerKeys.map(
  (key) => privateKeyToAccount(key).address,
);
