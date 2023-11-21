"use client";
import { AlchemyNFTAbi, alchNftContractAddress } from "@/config/alch-nft";
import { AlchemyTokenAbi, alchTokenContractAddress } from "@/config/alch-token";
import { useWalletContext } from "@/context/wallet";
import { PluginType } from "@/hooks/useAlchemyProvider";
import { getPluginTypeFromAddress } from "@/shared/util";
import { MSCA, SessionKeyPlugin, type Plugin } from "@alchemy/aa-accounts";
import { UserOperationCallData } from "@alchemy/aa-core";
import { useCallback, useState } from "react";
import { Address, Hash, encodeFunctionData } from "viem";

type MintStatus =
  | "Mint"
  | "Requesting"
  | "Minting"
  | "Received"
  | "Error Minting";

type PluginUoStatus = "Requesting" | "In Progress..." | "Done" | "Error";

export default function Content() {
  const {
    isLoggedIn,
    provider,
    scaAddress,
    installedPlugins,
    availablePlugins,
    pluginInstall,
    pluginUninstall,
    refetchInstalledPlugins,
    sessionKeySigner,
    tokenReceiverEnabled,
    sessionKeyEnabled,
  } = useWalletContext();
  const [mintTxHash, setMintTxHash] = useState<Hash>();
  const [mintStatus, setMintStatus] = useState<MintStatus>("Mint");
  const [mintType, setMintType] = useState<"erc20" | "erc721" | null>(null);

  const [pluginTxHash, setPluginTxHash] = useState<Hash>();
  const [pluginTxStatus, setPluginTxStatus] = useState<PluginUoStatus | null>(
    null
  );
  const [pluginType, setPluginType] = useState<PluginType | null>(null);

  const handleMint = useCallback(
    async (nft: boolean = false) => {
      if (!provider) {
        throw new Error("Provider not initialized");
      }

      if (nft && !tokenReceiverEnabled) {
        throw new Error("Account requires TokenReceiverPlugin installed first");
      }

      try {
        setMintTxHash(undefined);
        setMintStatus("Requesting");
        setMintType(nft ? "erc721" : "erc20");
        const userOpData: UserOperationCallData = {
          target: nft ? alchNftContractAddress : alchTokenContractAddress,
          data: encodeFunctionData({
            abi: nft ? AlchemyNFTAbi : AlchemyTokenAbi,
            functionName: nft ? "mintTo" : "mint",
            args: [await provider.getAddress()],
          }),
          value: BigInt(0),
        };

        const executeWithSessionKey =
          provider.isConnected<MSCA>() && sessionKeyEnabled && sessionKeySigner;
        console.log("executing with session key", executeWithSessionKey);
        const uoHash = executeWithSessionKey
          ? await provider
              .extend(SessionKeyPlugin.providerMethods)
              .executeWithSessionKey(
                {
                  args: [
                    [{ ...userOpData, value: userOpData.value || BigInt(0) }],
                    await sessionKeySigner.getAddress(),
                  ],
                },
                {
                  signer: sessionKeySigner,
                }
              )
          : await provider.sendUserOperation(userOpData);

        setMintStatus("Minting");
        const txHash: Hash = await provider.waitForUserOperationTransaction(
          uoHash.hash
        );

        setMintTxHash(txHash);
        setMintStatus("Received");
        setTimeout(() => {
          setMintStatus("Mint");
          setMintType(null);
        }, 5000);
      } catch (e) {
        console.error(e);
        setMintStatus("Error Minting");
        setTimeout(() => {
          setMintStatus("Mint");
          setMintType(null);
        }, 5000);
        return;
      }
    },
    [provider, sessionKeySigner, sessionKeyEnabled, tokenReceiverEnabled]
  );

  const handlePluginOp = useCallback(
    async (pluginAddress: Address, install: boolean) => {
      if (!provider) {
        throw new Error("Provider not initialized");
      }

      console.log(
        `${install ? "Installing" : "Uninstalling"} plugin ${pluginAddress}`
      );

      try {
        setPluginTxHash(undefined);
        setPluginTxStatus("Requesting");

        const pluginType = getPluginTypeFromAddress(
          pluginAddress as Address,
          provider.rpcClient.chain.id
        )!;
        setPluginType(pluginType);

        const uoHash = install
          ? await pluginInstall(pluginType)
          : await pluginUninstall(pluginType);
        if (!uoHash) {
          throw new Error(
            `Unexpected error trying to ${
              install ? "install" : "uninstall"
            } ${pluginType}`
          );
        }

        console.log("uoHash", JSON.stringify(uoHash, null, 2));

        setPluginTxStatus("In Progress...");
        const txHash: Hash = await provider.waitForUserOperationTransaction(
          uoHash.hash
        );
        await refetchInstalledPlugins(scaAddress!);

        setPluginTxHash(txHash);
        setPluginTxStatus("Done");
        setTimeout(() => {
          setPluginTxStatus(null);
          setPluginType(null);
        }, 5000);
      } catch (e) {
        console.error(e);
        setPluginTxStatus("Error");
        setTimeout(() => {
          setPluginTxStatus(null);
          setPluginType(null);
        }, 5000);
        return;
      }
    },
    [
      pluginInstall,
      pluginUninstall,
      provider,
      refetchInstalledPlugins,
      scaAddress,
    ]
  );

  if (typeof document !== "undefined") {
    document
      ?.getElementById("input-login-email")
      ?.addEventListener("keydown", function (event) {
        // Check if Enter was pressed
        if (event.key === "Enter") {
          // Prevent the default action
          event.preventDefault();
          // Trigger the button click
          document?.getElementById("button-login")?.click();
        }
      });

    document
      ?.getElementById("button-login-with-email")
      ?.addEventListener("click", function (event) {
        document?.getElementById("input-login-email")?.focus();
      });
  }

  return (
    <div className="flex flex-row items-center gap-[64px] max-md:flex-col max-md:text-center">
      <div className="flex flex-col items-start gap-[48px] max-md:items-center">
        <div className="text-2xl">
          Mint a FREE ERC-20 token with no gas fees!
        </div>
        <div className="flex flex-row flex-wrap gap-[12px]">
          <button
            disabled={
              !isLoggedIn || mintStatus !== "Mint" || pluginTxStatus !== null
            }
            onClick={() => handleMint()}
            className="btn text-white bg-gradient-1 disabled:opacity-25 disabled:text-white transition ease-in-out duration-500 transform hover:scale-110 max-md:w-full"
          >
            {mintType !== "erc20" ? "Mint" : mintStatus} The ALCH Token
            {mintType === "erc20" &&
              (mintStatus === "Requesting" || mintStatus === "Minting") && (
                <span className="loading loading-spinner loading-md"></span>
              )}
          </button>
          <button
            disabled={
              !isLoggedIn ||
              mintStatus !== "Mint" ||
              pluginTxStatus !== null ||
              !tokenReceiverEnabled
            }
            onClick={() => handleMint(true)}
            className="btn text-white bg-gradient-1 disabled:opacity-25 disabled:text-white transition ease-in-out duration-500 transform hover:scale-110 max-md:w-full"
          >
            {mintType !== "erc721" ? "Mint" : mintStatus} The ALCH NFT
            {mintType === "erc721" &&
              (mintStatus === "Requesting" || mintStatus === "Minting") && (
                <span className="loading loading-spinner loading-md"></span>
              )}
          </button>
          {mintTxHash && (
            <a
              href={`${provider?.rpcClient.chain.blockExplorers?.default.url}/tx/${mintTxHash}`}
              className="btn text-white bg-gradient-2 disabled:opacity-25 disabled:text-white transition ease-in-out duration-500 transform hover:scale-110 max-md:w-full"
            >
              Your Txn Details
            </a>
          )}
        </div>
        {provider.isConnected() && (
          <div className="flex flex-col flex-wrap gap-[12px]">
            <div className="text-2xl font-bold">Installed Plugins</div>
            {availablePlugins.map((plugin: Plugin<any, any>, i: number) => {
              const pluginAddress =
                plugin.meta.addresses[provider.rpcClient.chain.id];
              const pluginName = plugin.meta.name;
              const installed = installedPlugins.includes(
                pluginAddress as Address
              );
              return (
                <div
                  className="flex flex-row flex-wrap gap-[12px]"
                  key={pluginName}
                >
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`${provider.rpcClient.chain.blockExplorers?.default.url}/address/${pluginAddress}`}
                    className="text-blue-600 text-blue-600 dark:text-blue-500 hover:underline text-2l m-auto"
                    key={`plugin-${i}}`}
                  >
                    {pluginName}
                  </a>
                  <button
                    disabled={
                      !isLoggedIn ||
                      mintStatus !== "Mint" ||
                      pluginTxStatus !== null ||
                      installed
                    }
                    onClick={() =>
                      handlePluginOp(pluginAddress as Address, true)
                    }
                    className="btn text-white bg-gradient-1 disabled:opacity-25 disabled:text-white transition ease-in-out duration-500 transform hover:scale-110 max-md:w-full"
                  >
                    {pluginTxStatus === null || pluginType !== pluginName
                      ? "Install"
                      : pluginTxStatus}
                  </button>
                  <button
                    disabled={
                      !isLoggedIn ||
                      mintStatus !== "Mint" ||
                      pluginTxStatus !== null ||
                      !installed
                    }
                    onClick={() =>
                      handlePluginOp(pluginAddress as Address, false)
                    }
                    className="btn text-white bg-gradient-1 disabled:opacity-25 disabled:text-white transition ease-in-out duration-500 transform hover:scale-110 max-md:w-full"
                  >
                    {pluginTxStatus === null || pluginType !== pluginName
                      ? "Uninstall"
                      : pluginTxStatus}
                  </button>
                  {pluginTxHash && pluginType === pluginName && (
                    <a
                      href={`${provider?.rpcClient.chain.blockExplorers?.default.url}/tx/${pluginTxHash}`}
                      className="btn text-white bg-gradient-2 disabled:opacity-25 disabled:text-white transition ease-in-out duration-500 transform hover:scale-110 max-md:w-full"
                    >
                      Txn Details
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
