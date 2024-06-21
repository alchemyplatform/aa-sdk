import type { AuthCardProps } from "..";
import type { AuthStep } from "../../context";
import { CompletingEmailAuth, LoadingEmail } from "./email.js";
import { LoadingPasskeyAuth } from "./passkey.js";

type LoadingAuthProps = {
  config: AuthCardProps;
  context?: AuthStep;
};

// eslint-disable-next-line jsdoc/require-jsdoc
export const LoadingAuth = ({ context, config }: LoadingAuthProps) => {
  switch (context?.type) {
    case "email_verify":
      return <LoadingEmail config={config} context={context} />;
    case "passkey_verify":
      return <LoadingPasskeyAuth config={config} />;
    case "email_completing":
      return <CompletingEmailAuth context={context} />;
    default: {
      console.warn("Unhandled loading state! rendering empty state", context);
      return null;
    }
  }
};
