import { GoogleIcon } from "../../../icons/oauth.js";
import { Button } from "../../button.js";
import { useOAuthVerify } from "../hooks/useOAuthVerify.js";
import type { AuthType } from "../types.js";

type Props = Extract<AuthType, { type: "social" }>;

// Not used externally
// eslint-disable-next-line jsdoc/require-jsdoc
export const OAuth = ({ authProviderId }: Props) => {
  const { authenticate } = useOAuthVerify();

  if (authProviderId === "google") {
    return (
      <Button
        variant="social"
        icon={<GoogleIcon />}
        onClick={authenticate}
      ></Button>
    );
  }

  // TODO: add the other social providers
  return null;
};
