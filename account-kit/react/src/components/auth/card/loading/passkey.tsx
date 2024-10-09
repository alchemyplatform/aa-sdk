import { ls } from "../../../../strings.js";
import { LoadingPasskey } from "../../../../icons/passkey.js";
import { useAuthContext, type AuthStep } from "../../context.js";
import { ConnectionError } from "../error/connection-error.js";
import { usePasskeyVerify } from "../../hooks/usePasskeyVerify.js";

interface LoadingPasskeyAuthProps {
  authStep: Extract<AuthStep, { type: "passkey_verify" }>;
}
// eslint-disable-next-line jsdoc/require-jsdoc
export const LoadingPasskeyAuth = ({ authStep }: LoadingPasskeyAuthProps) => {
  const { setAuthStep } = useAuthContext();
  const { authenticate } = usePasskeyVerify();

  if (authStep.error) {
    return (
      <ConnectionError
        connectionType="passkey"
        handleTryAgain={authenticate}
        handleUseAnotherMethod={() => setAuthStep({ type: "initial" })}
      />
    );
  }

  return (
    <div className="flex flex-col w-full items-center">
      <div className="flex flex-col items-center justify-center mb-5">
        <LoadingPasskey />
      </div>

      <h3 className="font-semibold text-lg mb-2">{ls.loadingPasskey.title}</h3>
      <p className="text-fg-secondary text-center text-sm">
        {ls.loadingPasskey.body}
      </p>

      <div className="flex flex-col w-full items-center gap-1">
        {/* Hidden until we can read in support URLs from the config */}
        {/* <div className="flex items-center justify-center py-2 gap-x-1">
          <p className="text-fg-tertiary text-xs">
            {ls.loadingPasskey.supportText}
          </p>
          <Button variant="link" className="text-xs font-normal underline">
            {ls.loadingPasskey.supportLink}
          </Button>
        </div> */}
      </div>
      <button
        className="btn btn-secondary w-full mt-5"
        onClick={() => setAuthStep({ type: "initial" })}
      >
        Cancel
      </button>
    </div>
  );
};
