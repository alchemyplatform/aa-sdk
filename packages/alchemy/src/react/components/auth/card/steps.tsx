import { useAuthContext } from "../context.js";
import { AddPasskey } from "./add-passkey.js";
import type { AuthCardProps } from "./index.js";
import { LoadingAuth } from "./loading/index.js";
import { MainAuthContent } from "./main.js";

// eslint-disable-next-line jsdoc/require-jsdoc
export const Step = (props: AuthCardProps) => {
  const { authStep } = useAuthContext();

  switch (authStep.type) {
    case "email_verify":
    case "passkey_verify":
    case "email_completing":
      return <LoadingAuth context={authStep} />;
    case "passkey_create":
      return <AddPasskey />;
    case "complete":
    case "initial":
    default:
      return <MainAuthContent {...props} />;
  }
};
