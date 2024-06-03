import { PasskeyIcon } from "../../../icons/passkey.js";
import { Button } from "../../button.js";
import { usePasskeyVerify } from "../hooks/usePasskeyVerify.js";

type Props = {
  label?: string;
};

// Not used externally
// eslint-disable-next-line jsdoc/require-jsdoc
export const PasskeyAuth = ({ label = "Passkey" }: Props) => {
  const { authenticate } = usePasskeyVerify();

  return (
    <Button variant="social" icon={<PasskeyIcon />} onClick={authenticate}>
      {label}
    </Button>
  );
};
