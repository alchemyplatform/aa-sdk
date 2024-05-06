import { ChevronRight } from "../../icons/chevron.js";
import { MailIcon } from "../../icons/mail.js";
import { Button } from "../button.js";
import { Input } from "../input.js";
import type { AuthType } from "./types.js";

type EmailAuthProps = Extract<AuthType, { type: "email" }>;

// this is not used externally
// eslint-disable-next-line jsdoc/require-jsdoc
export const EmailAuth = ({
  hideButton = false,
  buttonLabel = "Continue",
  placeholder = "Email",
}: EmailAuthProps) => {
  // TODO: actually wire this up with `useAuthenticate` and other hooks
  return (
    <div className="flex flex-col gap-2 w-full">
      <Input
        placeholder={placeholder}
        iconLeft={<MailIcon />}
        iconRight={
          hideButton ? <ChevronRight className="match-input" /> : undefined
        }
      />
      {!hideButton ? <Button type="primary">{buttonLabel}</Button> : null}
    </div>
  );
};
