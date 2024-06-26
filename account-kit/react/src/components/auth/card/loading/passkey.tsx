import { ls } from "../../../../strings.js";
import { LoadingPasskey } from "../../../../icons/passkey.js";
import { Button } from "../../../button.js";
import { PoweredBy } from "../../../poweredby.js";
import type { AlchemyAccountsUIConfig } from "../../../../context.js";

// eslint-disable-next-line jsdoc/require-jsdoc
export const LoadingPasskeyAuth = ({
  config,
}: {
  config: AlchemyAccountsUIConfig;
}) => {
  return (
    <div className="flex flex-col gap-5 items-center">
      <div className="flex flex-col items-center justify-center">
        <LoadingPasskey
          illustrationStyle={config.illustrationStyle ?? "flat"}
        />
      </div>

      <h3 className="font-semibold text-lg">{ls.loadingPasskey.title}</h3>
      <p className="text-fg-secondary text-center text-sm">
        {ls.loadingPasskey.body}
      </p>

      <div className="flex flex-col w-full items-center gap-1">
        <div className="flex items-center justify-center py-2 gap-x-2">
          <p className="text-fg-tertiary text-xs">
            {ls.loadingPasskey.supportText}
          </p>
          <Button variant="link" className="text-xs font-normal underline">
            {ls.loadingPasskey.supportLink}
          </Button>
        </div>
        <PoweredBy />
      </div>
    </div>
  );
};
