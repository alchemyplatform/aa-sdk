import type { AuthContext } from "../../context";
import { LoadingEmail } from "./email.js";

type LoadingAuthProps = {
  context?: AuthContext;
};

// eslint-disable-next-line jsdoc/require-jsdoc
export const LoadingAuth = ({ context }: LoadingAuthProps) => {
  switch (context?.type) {
    case "email":
      return <LoadingEmail context={context} />;
    case "passkey":
      return <div>Follow the prompts in your browser?</div>;
    default:
      return <div>Logging you in...</div>;
  }
};
