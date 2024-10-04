import { useAddPasskey } from "../../../hooks/useAddPasskey.js";
import { AddPasskeyIllustration } from "../../../icons/illustrations/add-passkey.js";
import {
  PasskeyShieldIllustration,
  PasskeySmileyIllustration,
} from "../../../icons/illustrations/passkeys.js";
import { ReactLogger } from "../../../metrics.js";
import { ls } from "../../../strings.js";
import { Button } from "../../button.js";
import { useAuthContext } from "../context.js";
import { ConnectionError } from "./error/connection-error.js";

const BENEFITS = [
  {
    icon: PasskeySmileyIllustration,
    title: ls.addPasskey.simplerLoginTitle,
    description: ls.addPasskey.simplerLoginDescription,
  },
  {
    icon: PasskeyShieldIllustration,
    title: ls.addPasskey.enhancedSecurityTitle,
    description: ls.addPasskey.enhancedSecurityDescription,
  },
];

export const AddPasskey = () => {
  const { setAuthStep, authStep } = useAuthContext("passkey_create");
  const { addPasskey, isAddingPasskey } = useAddPasskey({
    onSuccess: () => {
      ReactLogger.trackEvent({
        name: "add_passkey_on_signup_success",
      });

      setAuthStep({ type: "passkey_create_success" });
    },
    onError: () => {
      setAuthStep({
        type: "passkey_create",
        error: new Error("Failed to add passkey"),
      });
    },
  });

  if (authStep.error) {
    return (
      <ConnectionError
        connectionType="passkey"
        handleTryAgain={addPasskey}
        handleUseAnotherMethod={() => setAuthStep({ type: "complete" })}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5 items-center">
      <div className="flex flex-col items-center justify-center h-12 w-12">
        <AddPasskeyIllustration height="48" width="48" />
      </div>

      <h3 className="font-semibold text-lg">{ls.addPasskey.title}</h3>

      <div className="flex flex-col w-full gap-3">
        {BENEFITS.map(({ title, icon: Icon, description }) => (
          <div key={title} className="flex gap-2">
            <div className="h-5 w-5 flex items-center justify-center">
              <Icon />
            </div>
            <div className="flex flex-col">
              <p className="font-semibold text-sm">{title}</p>
              <p className="text-fg-secondary text-sm">{description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col w-full gap-3">
        <Button
          variant="primary"
          onClick={() => addPasskey()}
          disabled={isAddingPasskey}
        >
          {ls.addPasskey.continue}
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            ReactLogger.trackEvent({
              name: "add_passkey_on_signup_skip",
            });
            setAuthStep({ type: "complete" });
          }}
          disabled={isAddingPasskey}
        >
          {ls.addPasskey.skip}
        </Button>
      </div>
    </div>
  );
};
