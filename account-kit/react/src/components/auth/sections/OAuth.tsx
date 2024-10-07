import { GoogleIcon } from "../../../icons/oauth.js";
import { Button } from "../../button.js";
import { useOAuthVerify } from "../hooks/useOAuthVerify.js";

type Props = {
  googleAuth: boolean;
};

// Not used externally
// eslint-disable-next-line jsdoc/require-jsdoc
export const OAuth = ({ googleAuth }: Props) => {
  const { authenticate } = useOAuthVerify();

  return (
    googleAuth && (
      <Button
        variant="social"
        icon={<GoogleIcon />}
        onClick={authenticate}
      ></Button>
    )
  );
};
