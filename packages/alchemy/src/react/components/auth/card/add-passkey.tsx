import { useAddPasskey } from "../../../hooks/useAddPasskey.js";
import {
  PasskeyIllustration,
  PasskeyShield,
  PasskeySmiley,
} from "../../../icons/passkey.js";
import { ls } from "../../../strings.js";
import { Button } from "../../button.js";
import { PoweredBy } from "../../poweredby.js";
import { useAuthContext } from "../context.js";

const BENEFITS = [
  {
    icon: <PasskeySmiley />,
    title: ls.addPasskey.simplerLoginTitle,
    description: ls.addPasskey.simplerLoginDescription,
  },
  {
    icon: <PasskeyShield />,
    title: ls.addPasskey.enhancedSecurityTitle,
    description: ls.addPasskey.enhancedSecurityDescription,
  },
];

// eslint-disable-next-line jsdoc/require-jsdoc
export const AddPasskey = () => {
  const { setAuthStep } = useAuthContext();
  const { addPasskey, isAddingPasskey } = useAddPasskey({
    onSuccess: () => {
      setAuthStep({ type: "passkey_create_success" });
    },
  });

  return (
    <div className="flex flex-col gap-5 items-center">
      <div className="flex flex-col items-center justify-center h-12 w-12">
        <PasskeyIllustration />
      </div>

      <h3 className="font-semibold text-lg">{ls.addPasskey.title}</h3>

      <div className="flex flex-col w-full gap-3">
        {BENEFITS.map(({ title, icon, description }) => (
          <div key={title} className="flex gap-2">
            <div className="h-5 w-5 flex items-center justify-center">
              {icon}
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
      <PoweredBy />
    </div>
  );
};
