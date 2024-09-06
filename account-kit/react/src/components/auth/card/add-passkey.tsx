import { useAddPasskey } from "../../../hooks/useAddPasskey.js";
import { AddPasskeyIllustration } from "../../../icons/illustrations/add-passkey.js";
import {
  PasskeyShieldIllustration,
  PasskeySmileyIllustration,
} from "../../../icons/illustrations/passkeys.js";
import { ls } from "../../../strings.js";
import { Button } from "../../button.js";
import { useAuthContext, type AuthStep } from "../context.js";
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

type AddPasskeyProps = {
  authStep: Extract<AuthStep, { type: "passkey_create" }>;
};

// eslint-disable-next-line jsdoc/require-jsdoc
export const AddPasskey = ({ authStep }: AddPasskeyProps) => {
  const { setAuthStep } = useAuthContext();
  const { addPasskey, isAddingPasskey } = useAddPasskey({
    onSuccess: () => {
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
          onClick={() => setAuthStep({ type: "complete" })}
          disabled={isAddingPasskey}
        >
          {ls.addPasskey.skip}
        </Button>
      </div>
    </div>
  );
};
