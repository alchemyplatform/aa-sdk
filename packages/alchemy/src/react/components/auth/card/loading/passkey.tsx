import { PasskeyIllustration } from "../../../../icons/passkey.js";
import { Button } from "../../../button.js";
import { PoweredBy } from "../../../poweredby.js";

// eslint-disable-next-line jsdoc/require-jsdoc
export const LoadingPasskeyAuth = () => {
  return (
    <div className="flex flex-col gap-5 items-center">
      <div className="flex flex-col items-center justify-center h-12 w-12">
        <PasskeyIllustration />
      </div>

      <h3 className="font-semibold text-lg">Continue with passkey</h3>
      <p className="text-fg-secondary text-center text-sm">
        Follow the prompt to verify your passkey.
      </p>

      <div className="flex flex-col w-full items-center gap-1">
        <div className="flex items-center justify-center py-2 gap-x-2">
          <p className="text-fg-tertiary text-xs">Having trouble?</p>
          <Button variant="link" className="text-xs font-normal underline">
            Contact support
          </Button>
        </div>
        <PoweredBy />
      </div>
    </div>
  );
};
