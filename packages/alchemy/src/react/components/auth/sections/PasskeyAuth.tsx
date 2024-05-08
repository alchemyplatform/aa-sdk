import { useAuthenticate } from "../../../hooks/useAuthenticate.js";
import { PasskeyIcon } from "../../../icons/passkey.js";
import { Button } from "../../button.js";
import { useAuthContext } from "../context.js";

type Props = {
  label?: string;
};

// Not used externally
// eslint-disable-next-line jsdoc/require-jsdoc
export const PasskeyAuth = ({ label = "Passkey" }: Props) => {
  const { setAuthContext } = useAuthContext();
  const { authenticate } = useAuthenticate({
    onMutate: () => {
      setAuthContext({ type: "passkey" });
    },
    onError: (error) => {
      // TODO: need to handle this and show it to the user
      console.error(error);
      setAuthContext(undefined);
    },
  });

  return (
    <Button
      type="social"
      icon={<PasskeyIcon />}
      onClick={() =>
        authenticate({
          type: "passkey",
          createNew: false,
        })
      }
    >
      {label}
    </Button>
  );
};
