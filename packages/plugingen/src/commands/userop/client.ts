import {
  LocalAccountSigner,
  createBundlerClient,
  createSimpleSmartAccount,
  createSmartAccountClientFromExisting,
  getEntryPoint,
  type SmartAccountClient,
  type SmartContractAccount,
} from "@alchemy/aa-core";
import { custom, http, isHex, type Chain, type Transport } from "viem";
import type { UserOpConfig } from "./type";

export const createSmartAccountClientFromConfig = async (
  config: UserOpConfig
): Promise<SmartAccountClient<Transport, Chain, SmartContractAccount>> => {
  const client = createBundlerClient({
    chain: config.chain,
    transport:
      typeof config.connection_config === "string"
        ? http(config.connection_config)
        : (opts) => {
            const connection_config = config.connection_config as {
              public: string;
              bundler: string;
            };
            const bundlerRpc = http(connection_config.bundler)(opts);
            const publicRpc = http(connection_config.public)(opts);

            return custom({
              request: async (args) => {
                const bundlerMethods = new Set([
                  "eth_sendUserOperation",
                  "eth_estimateUserOperationGas",
                  "eth_getUserOperationReceipt",
                  "eth_getUserOperationByHash",
                  "eth_supportedEntryPoints",
                ]);

                if (bundlerMethods.has(args.method)) {
                  return bundlerRpc.request(args);
                } else {
                  return publicRpc.request(args);
                }
              },
            })(opts);
          },
  });

  const signer = config.account.owner.includes(" ")
    ? LocalAccountSigner.mnemonicToAccountSigner(config.account.owner)
    : LocalAccountSigner.privateKeyToAccountSigner(
        isHex(config.account.owner)
          ? config.account.owner
          : `0x${config.account.owner}`
      );

  const account =
    config.entrypoint === "0.7.0"
      ? await createSimpleSmartAccount({
          chain: config.chain,
          signer,
          entryPoint: getEntryPoint(config.chain, {
            version: "0.7.0",
          }),
          transport: custom(client),
        })
      : await createSimpleSmartAccount({
          chain: config.chain,
          signer,
          entryPoint: getEntryPoint(config.chain),
          transport: custom(client),
        });

  const smartAccountClient = await createSmartAccountClientFromExisting({
    client,
    account,
  });

  // const address = await smartAccountClient.getAddress();
  // console.log(`Account address: ${address}`);

  return smartAccountClient as SmartAccountClient<
    Transport,
    Chain,
    SmartContractAccount
  >;
};
