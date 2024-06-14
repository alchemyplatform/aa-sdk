import type { AuthStep } from "../context";
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
