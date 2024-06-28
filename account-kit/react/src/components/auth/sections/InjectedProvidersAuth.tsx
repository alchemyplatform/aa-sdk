import type { Connector } from "@wagmi/core";
import { useChain } from "../../../hooks/useChain.js";
import { useConnect } from "../../../hooks/useConnect.js";
import { Button } from "../../button.js";
import { useAuthContext } from "../context.js";

// eslint-disable-next-line jsdoc/require-jsdoc
export const InjectedProvidersAuth = () => {
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
    <div className="flex flex-row gap-2 flex-wrap">
      {connectors.map((connector) => {
        return (
          <Button
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
  );
};
