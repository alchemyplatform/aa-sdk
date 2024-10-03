import { GoogleIcon } from "../../../icons/google.js";
import { Button } from "../../button.js";

type Props = {
  googleAuth: boolean;
};

// Not used externally
// eslint-disable-next-line jsdoc/require-jsdoc
export const SocialAuth = ({ googleAuth }: Props) => {
  console.log(googleAuth);
  return (
    googleAuth && (
      <Button
        variant="social"
        icon={<GoogleIcon />}
        onClick={() => {}}
      ></Button>
    )
  );
};
