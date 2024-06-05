import type { AuthStep } from "../../context";
import { CompletingEmailAuth, LoadingEmail } from "./email.js";
import { LoadingPasskeyAuth } from "./passkey.js";

type LoadingAuthProps = {
  context?: AuthStep;
};

// eslint-disable-next-line jsdoc/require-jsdoc
export const LoadingAuth = ({ context }: LoadingAuthProps) => {
  switch (context?.type) {
    case "email_verify":
      return <LoadingEmail context={context} />;
    case "passkey_verify":
      return <LoadingPasskeyAuth />;
    case "email_completing":
      return <CompletingEmailAuth context={context} />;
    default: {
      console.warn("Unhandled loading state! rendering empty state", context);
      return null;
    }
  }
};
