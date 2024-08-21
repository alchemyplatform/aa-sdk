import { type Connector } from "wagmi";
import { useChain } from "../../../hooks/useChain.js";
import { useConnect } from "../../../hooks/useConnect.js";
import { Button } from "../../button.js";
import { useAuthContext, type AuthStep } from "../context.js";
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

export const EoaPickCard = () => {
  const { chain } = useChain();
  const { connectors, connect } = useConnect({
    onMutate: ({ connector }) => {
      // This typecast is ok because the only way this is called is with a Connector (see below)
      setAuthStep({ type: "eoa_connect", connector: connector as Connector });
    },
    onSettled: (_result, error, { connector }) => {
      if (error) {
        // This typecast is ok because the only way this is called is with a Connector (see below)
        setAuthStep({
          type: "eoa_connect",
          connector: connector as Connector,
          error,
        });
        return;
      }

      setAuthStep({ type: "complete" });
    },
  });
  const { setAuthStep } = useAuthContext();

  if (!connectors.length) {
    return null;
  }

  return (
    <CardContent
      className="w-full"
      header="Select your wallet"
      description={
        <div className="flex flex-col gap-3 w-full">
          {connectors.map((connector) => {
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
                  setAuthStep({ type: "eoa_connect", connector });
                }}
              >
                {connector.name}
              </Button>
            );
          })}
        </div>
      }
    />
  );
};
