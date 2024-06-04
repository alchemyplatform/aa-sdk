import { PasskeyIcon } from "../../../../icons/passkey.js";
import { Button } from "../../../button.js";
import { ErrorContainer } from "../../../error.js";
import { PoweredBy } from "../../../poweredby.js";
import { type AuthStep } from "../../context.js";
import { usePasskeyVerify } from "../../hooks/usePasskeyVerify.js";

interface LoadingPasskeyAuthProps {
  context: Extract<AuthStep, { type: "passkey_verify" }>;
}

// eslint-disable-next-line jsdoc/require-jsdoc
export const LoadingPasskeyAuth = ({
  context: { error },
}: LoadingPasskeyAuthProps) => {
  const { authenticate } = usePasskeyVerify();

  return (
    <div className="flex flex-col gap-5 items-center">
      <span className="text-lg text-fg-primary font-semibold">
        Verify passkey
      </span>
      <div className="flex flex-col items-center justify-center border-fg-accent-brand bg-bg-surface-inset rounded-[100%] w-[56px] h-[56px] border">
        <PasskeyIcon />
      </div>
      <p className="text-fg-secondary text-center font-normal text-sm">
        Follow the steps on your device to create or verify your passkey
      </p>
      {error && (
        <>
          <ErrorContainer error={error} />
          <Button className="btn btn-primary w-full" onClick={authenticate}>
            Retry
          </Button>
        </>
      )}
      <div className="flex flex-row rounded-lg bg-bg-surface-inset justify-between py-2 px-4 w-full items-center text-xs">
        <span className="font-normal text-fg-secondary">Having trouble?</span>
        <Button variant="link" className="text-xs font-semibold">
          Contact support
        </Button>
      </div>
      <PoweredBy />
    </div>
  );
};
