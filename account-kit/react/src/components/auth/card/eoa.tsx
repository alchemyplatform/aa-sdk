import { useMemo } from "react";
import { walletConnect } from "wagmi/connectors";
import { useChain } from "../../../hooks/useChain.js";
import { useConnect } from "../../../hooks/useConnect.js";
import { useUiConfig } from "../../../hooks/useUiConfig.js";
import { WalletConnectIcon } from "../../../icons/walletConnect.js";
import { Button } from "../../button.js";
import { useAuthContext, type AuthStep } from "../context.js";
import type { AuthType } from "../types.js";
import { CardContent } from "./content.js";

interface Props {
  authStep: Extract<AuthStep, { type: "eoa_connect" }>;
}

// eslint-disable-next-line jsdoc/require-jsdoc
export const EoaConnectCard = ({ authStep }: Props) => {
  return (
    <CardContent
      header={`Connecting to ${authStep.connector.name}`}
      icon={
        <img
          className={authStep.error ? undefined : "animate-pulse"}
          src={authStep.connector.icon}
          alt={authStep.connector.name}
          height={48}
          width={48}
        />
      }
      description="Please follow the instructions in your wallet to connect."
      error={authStep.error}
    />
  );
};

type WalletConnectCardProps = {
  authStep: Extract<AuthStep, { type: "wallet_connect" }>;
};

export const WalletConnectCard = ({ authStep }: WalletConnectCardProps) => {
  // If error render the error card here?
  return (
    <CardContent
      header={`Connecting to WalletConnect`}
      icon={
        <WalletConnectIcon
          className={
            "w-[48px] h-[48px]" + (authStep.error ? "" : " animate-pulse")
          }
        />
      }
      description="Please follow the instructions in the popup to connect."
      error={authStep.error}
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

  const {
    auth: { sections },
  } = useUiConfig();

  const walletConnectConfig = useMemo(() => {
    const externalWalletSection = sections
      .find((x) => x.some((y) => y.type === "external_wallets"))
      ?.find((x) => x.type === "external_wallets") as
      | Extract<AuthType, { type: "external_wallets" }>
      | undefined;

    return externalWalletSection?.walletConnect;
  }, [sections]);

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

  const walletConnectConnector = walletConnectConfig
    ? walletConnect(walletConnectConfig)
    : null;

  return (
    <CardContent
      className="w-full"
      header="Select your wallet"
      description={
        walletConnectConfig != null || connectors.length ? (
          <div className="flex flex-col gap-3 w-full">
            {connectorButtons}
            {walletConnectConnector && (
              <Button
                className="justify-start"
                variant="social"
                icon={<WalletConnectIcon className="w-[20px] h-[20px]" />}
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
