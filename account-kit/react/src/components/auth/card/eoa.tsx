import { walletConnect } from "wagmi/connectors";
import { useChain } from "../../../hooks/useChain.js";
import { Spinner } from "../../../icons/spinner.js";
import { WalletConnectIcon } from "../../../icons/walletConnectIcon.js";
import { Button } from "../../button.js";
import { useAuthContext } from "../context.js";
import { CardContent } from "./content.js";
import { ConnectionError } from "./error/connection-error.js";
import { type CustomErrorMessage } from "./error/types.js";
import { EOAWallets } from "./error/types.js";
import { useConnectEOA } from "../hooks/useConnectEOA.js";
import { useWalletConnectAuthConfig } from "../hooks/useWalletConnectAuthConfig.js";
import { useSigner } from "../../../hooks/useSigner.js";

export const EoaConnectCard = () => {
  const { setAuthStep, authStep } = useAuthContext("eoa_connect");
  const { connect } = useConnectEOA();
  const { chain } = useChain();
  const signer = useSigner();

  if (authStep.error) {
    return (
      <ConnectionError
        connectionType="wallet"
        EOAConnector={authStep.connector}
        handleTryAgain={() => {
          setAuthStep({
            type: "eoa_connect",
            connector: authStep.connector,
          });

          // Re-try connector's connection...
          connect({
            connector: authStep.connector,
            chainId: chain.id,
          });
        }}
        handleUseAnotherMethod={() => setAuthStep({ type: "pick_eoa" })}
      />
    );
  }
  return (
    <CardContent
      header={`Connecting to ${authStep.connector.name}`}
      className={"gap-0"}
      icon={
        <div className="flex relative flex-col items-center justify-center h-[58px] w-[58px] mb-5">
          <img
            className={authStep.error ? undefined : "animate-pulse"}
            src={authStep.connector.icon}
            alt={authStep.connector.name}
            height={28}
            width={28}
          />
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-[1]">
            <Spinner />
          </div>
        </div>
      }
      description="Please follow the instructions in your wallet to connect."
      error={authStep.error}
      secondaryButton={{
        title: "Cancel",
        onClick: async () => {
          // Ensure to stop all inflight requests
          await signer?.disconnect();
          setAuthStep({ type: "initial" });
        },
      }}
    />
  );
};

export const WalletConnectCard = () => {
  const { setAuthStep, authStep } = useAuthContext("wallet_connect");
  const { walletConnectParams } = useWalletConnectAuthConfig();
  const { chain } = useChain();
  const signer = useSigner();
  const walletConnectConnector = walletConnectParams
    ? walletConnect(walletConnectParams)
    : null;

  const { connect } = useConnectEOA();

  if (authStep.error) {
    const customErrorMessage = getCustomErrorMessage(authStep.error);
    return (
      <ConnectionError
        connectionType="wallet"
        EOAConnector={EOAWallets.WALLET_CONNECT}
        customErrorMessage={customErrorMessage}
        handleTryAgain={() => {
          setAuthStep({ type: "wallet_connect" });

          // Re-try wallet connect's connection...
          walletConnectConnector &&
            connect({
              connector: walletConnectConnector,
              chainId: chain.id,
            });
        }}
        handleUseAnotherMethod={() => setAuthStep({ type: "pick_eoa" })}
      />
    );
  }

  // If error render the error card here?
  return (
    <CardContent
      header={`Connecting to WalletConnect`}
      className={"gap-0"}
      icon={
        <div className="flex relative flex-col items-center justify-center h-[58px] w-[58px] mb-5">
          <WalletConnectIcon
            className={
              "w-[32px] h-[32px]" + (authStep.error ? "" : " animate-pulse")
            }
          />
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-[1]">
            <Spinner />
          </div>
        </div>
      }
      description={"Please follow the instructions in the popup to connect."}
      error={authStep.error}
      secondaryButton={{
        title: "Cancel",
        onClick: async () => {
          // Ensure to stop all inflight requests
          await signer?.disconnect();
          setAuthStep({ type: "initial" });
        },
      }}
    />
  );
};

export const EoaPickCard = () => {
  const { chain } = useChain();
  const { connectors, connect } = useConnectEOA();

  const { walletConnectParams } = useWalletConnectAuthConfig();

  const connectorButtons = connectors.map((connector) => {
    return (
      <Button
        className="justify-start"
        variant="social"
        key={connector.id}
        icon={
          connector.icon && (
            <img
              src={connector.icon}
              alt={connector.name}
              height={20}
              width={20}
            />
          )
        }
        onClick={() => {
          connect({ connector, chainId: chain.id });
        }}
      >
        {connector.name}
      </Button>
    );
  });

  const walletConnectConnector = walletConnectParams
    ? walletConnect(walletConnectParams)
    : null;

  return (
    <CardContent
      className="w-full"
      header="Select your wallet"
      description={
        walletConnectConnector != null || connectors.length ? (
          <div className="flex flex-col gap-3 w-full">
            {connectorButtons}
            {walletConnectConnector && (
              <Button
                className="justify-start"
                variant="social"
                icon={<WalletConnectIcon className="w-[25px] h-[25px]" />}
                onClick={() => {
                  connect({
                    connector: walletConnectConnector,
                    chainId: chain.id,
                  });
                }}
              >
                WalletConnect
              </Button>
            )}
          </div>
        ) : (
          "No wallets available"
        )
      }
    />
  );
};

const customErrorMessages: Record<string, CustomErrorMessage> = {
  chainIdNotFound: {
    heading: "The connected wallet does not support this network",
    body: "The wallet connection failed.",
    tryAgainCTA: "Try again with a different wallet",
  },
};

const getCustomErrorMessage = (error: Error) => {
  if (error.message.includes("ChainId not found")) {
    return customErrorMessages.chainIdNotFound;
  }

  // Use default error message
  return null;
};
