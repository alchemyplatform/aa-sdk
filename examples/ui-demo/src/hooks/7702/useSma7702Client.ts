import { useSigner } from "@account-kit/react";
import { useState, useEffect } from "react";
import { createSMA7702AccountClient } from "@account-kit/smart-contracts/experimental";
import { odyssey, splitOdysseyTransport } from "./transportSetup";
import {
  alchemyFeeEstimator,
  alchemyGasManagerMiddleware,
} from "@account-kit/infra";

export const useSma7702Client = () => {
  const signer = useSigner();

  const [client, setClient] = useState<Awaited<
    ReturnType<typeof createSMA7702AccountClient>
  > | null>(null);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      if (!signer) {
        return;
      }

      const client = await createSMA7702AccountClient({
        chain: odyssey,
        transport: splitOdysseyTransport,
        signer,
        feeEstimator: alchemyFeeEstimator(splitOdysseyTransport),
        ...alchemyGasManagerMiddleware(
          process.env.NEXT_PUBLIC_PAYMASTER_POLICY_ID!
        ),
      });

      if (!isMounted) {
        return;
      }

      setClient(client);
    };

    init();

    return () => {
      isMounted = false;
    };
  }, [signer]);

  return client;
};
