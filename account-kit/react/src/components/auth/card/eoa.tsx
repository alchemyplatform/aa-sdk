import { walletConnect, type WalletConnectParameters } from "wagmi/connectors";
import { useAuthConfig } from "../../../hooks/internal/useAuthConfig.js";
import { useChain } from "../../../hooks/useChain.js";
import { useConnect } from "../../../hooks/useConnect.js";
import { Spinner } from "../../../icons/spinner.js";
import { WalletConnectIcon } from "../../../icons/walletConnectIcon.js";
import { Button } from "../../button.js";
import { useAuthContext } from "../context.js";
import type { AuthType } from "../types.js";
import { CardContent } from "./content.js";
import { ConnectionError } from "./error/connection-error.js";
import { EOAWallets } from "./error/types.js";

export const EoaConnectCard = () => {
  const { setAuthStep, authStep } = useAuthContext("eoa_connect");

  if (authStep.error) {
    return (
      <ConnectionError
        connectionType="wallet"
        EOAConnector={authStep.connector}
        handleTryAgain={() =>
          setAuthStep({
            type: "eoa_connect",
            connector: authStep.connector,
          })
        }
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
        onClick: () => setAuthStep({ type: "initial" }),
      }}
    />
  );
};

export const WalletConnectCard = () => {
  const { setAuthStep, authStep } = useAuthContext("wallet_connect");

  if (authStep.error) {
    return (
      <ConnectionError
        connectionType="wallet"
        EOAConnector={EOAWallets.WALLET_CONNECT}
        handleTryAgain={() => setAuthStep({ type: "wallet_connect" })}
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
        onClick: () => setAuthStep({ type: "initial" }),
      }}
    />
  );
};

export const EoaPickCard = () => {
  const { chain } = useChain();
  const { connectors, connect } = useConnect({
    onMutate: ({ connector }) => {
      if (typeof connector === "function") {
        setAuthStep({ type: "wallet_connect" });
      } else {
        setAuthStep({ type: "eoa_connect", connector });
      }
    },
    onError: (error, { connector }) => {
      if (typeof connector === "function") {
        setAuthStep({ type: "wallet_connect", error });
      } else {
        setAuthStep({ type: "eoa_connect", connector, error });
      }
    },
    onSuccess: () => {
      setAuthStep({ type: "complete" });
    },
  });
  const { setAuthStep } = useAuthContext();

  const walletConnectAuthConfig = useAuthConfig((auth) => {
    const externalWalletSection = auth.sections
      .find((x) => x.some((y) => y.type === "external_wallets"))
      ?.find((x) => x.type === "external_wallets") as
      | Extract<AuthType, { type: "external_wallets" }>
      | undefined;

    return externalWalletSection?.walletConnect;
  });

  // Add z-index to the wallet connect modal if not already set
  const walletConnectParams = walletConnectAuthConfig
    ? ({
        ...walletConnectAuthConfig,
        qrModalOptions: {
          ...walletConnectAuthConfig.qrModalOptions,
          themeVariables: {
            "--wcm-z-index": "1000000",
            ...walletConnectAuthConfig.qrModalOptions?.themeVariables,
          },
        },
      } as WalletConnectParameters)
    : undefined;

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
