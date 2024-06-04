import { useAddPasskey } from "../../../hooks/useAddPasskey.js";
import { PasskeyIcon } from "../../../icons/passkey.js";
import { Button } from "../../button.js";
import { PoweredBy } from "../../poweredby.js";
import { useAuthContext } from "../context.js";

// eslint-disable-next-line jsdoc/require-jsdoc
export const AddPasskey = () => {
  const { setAuthStep } = useAuthContext();
  const { addPasskey, isAddingPasskey } = useAddPasskey({
    onSuccess: () => {
      setAuthStep({ type: "complete" });
    },
  });

  return (
    <div className="flex flex-col gap-5 items-center">
      <span className="text-lg text-fg-primary font-semibold">
        Add a passkey?
      </span>
      <div className="flex flex-col items-center justify-center border-fg-accent-brand bg-bg-surface-inset rounded-[100%] w-[56px] h-[56px] border">
        <PasskeyIcon />
      </div>
      <p className="text-fg-secondary text-center font-normal text-sm">
        Passkeys allow for a simple and secure user experience. Login in and
        sign transactions in seconds
      </p>
      <Button
        type="primary"
        className="w-full"
        onClick={() => addPasskey()}
        disabled={isAddingPasskey}
      >
        Continue
      </Button>
      <Button
        type="secondary"
        className="w-full"
        onClick={() => setAuthStep({ type: "complete" })}
        disabled={isAddingPasskey}
      >
        Skip
      </Button>
      <PoweredBy />
    </div>
  );
};
