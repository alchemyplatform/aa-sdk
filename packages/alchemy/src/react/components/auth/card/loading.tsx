import type { AuthContext } from "../context";

type LoadingAuthProps = {
  context?: AuthContext;
};

// eslint-disable-next-line jsdoc/require-jsdoc
export const LoadingAuth = ({ context }: LoadingAuthProps) => {
  switch (context?.type) {
    case "email":
      return <div>Check your email ({context.email})</div>;
    case "passkey":
      return <div>Follow the prompts in your browser?</div>;
    default:
      return <div>Logging you in...</div>;
  }
};
