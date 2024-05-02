import { PasskeyIcon } from "../../icons/passkey.js";
import { Button } from "../button.js";

type Props = {
  label?: string;
};

// Not used externally
// eslint-disable-next-line jsdoc/require-jsdoc
export const PasskeyAuth = ({ label = "Passkey" }: Props) => {
  // TODO: actually wire this up with `useAuthenticate` and other hooks
  return (
    <Button type="social" icon={<PasskeyIcon />}>
      {label}
    </Button>
  );
};
