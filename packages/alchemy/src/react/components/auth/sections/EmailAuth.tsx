import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { z } from "zod";
import { useAuthenticate } from "../../../hooks/useAuthenticate.js";
import { ChevronRight } from "../../../icons/chevron.js";
import { MailIcon } from "../../../icons/mail.js";
import { Button } from "../../button.js";
import { Input } from "../../input.js";
import { useAuthContext } from "../context.js";
import type { AuthType } from "../types.js";

type EmailAuthProps = Extract<AuthType, { type: "email" }>;

// this is not used externally
// eslint-disable-next-line jsdoc/require-jsdoc
export const EmailAuth = ({
  hideButton = false,
  buttonLabel = "Continue",
  placeholder = "Email",
}: EmailAuthProps) => {
  const { setAuthStep } = useAuthContext();
  const { authenticateAsync, error, isPending } = useAuthenticate({
    onMutate: (params) => {
      if ("email" in params) {
        setAuthStep({ type: "email_verify", email: params.email });
      }
    },
    onError: (error) => {
      // TODO: need to handle this and show it to the user
      console.error(error);
      // TODO: need to pass this error along
      setAuthStep({ type: "initial" });
    },
  });

  const form = useForm({
    defaultValues: {
      email: "",
    },
    onSubmit: async ({ value: { email } }) => {
      await authenticateAsync({ type: "email", email });
    },
    validatorAdapter: zodValidator,
  });

  return (
    <form
      onSubmit={(e) => {
        e.stopPropagation();
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <div className="flex flex-col gap-2 w-full">
        <form.Field
          name="email"
          validators={{
            onBlur: z.string().email("Must provide a valid email."),
          }}
        >
          {(field) => (
            <Input
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              placeholder={placeholder}
              error={
                field.state.meta.touchedErrors.length
                  ? field.state.meta.touchedErrors[0]?.toString()
                  : error?.message
              }
              iconLeft={<MailIcon />}
              iconRight={
                hideButton ? (
                  <ChevronRight
                    className="match-input cursor-pointer"
                    onClick={() => form.handleSubmit()}
                  />
                ) : undefined
              }
              disabled={isPending}
            />
          )}
        </form.Field>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) =>
            !hideButton ? (
              <Button
                type="primary"
                disabled={isPending || !canSubmit || isSubmitting}
              >
                {buttonLabel}
              </Button>
            ) : null
          }
        </form.Subscribe>
      </div>
    </form>
  );
};
