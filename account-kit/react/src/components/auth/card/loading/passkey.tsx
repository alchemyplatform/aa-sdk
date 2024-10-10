import { LoadingPasskey } from "../../../../icons/passkey.js";
import { ls } from "../../../../strings.js";
import { useAuthContext } from "../../context.js";
import { usePasskeyVerify } from "../../hooks/usePasskeyVerify.js";
import { ConnectionError } from "../error/connection-error.js";

export const LoadingPasskeyAuth = () => {
  const { setAuthStep, authStep } = useAuthContext("passkey_verify");
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
    <div className="flex flex-col gap-5 items-center">
      <div className="flex flex-col items-center justify-center">
        <LoadingPasskey />
      </div>

      <h3 className="font-semibold text-lg">{ls.loadingPasskey.title}</h3>
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
    </div>
  );
};
