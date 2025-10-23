import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { memo } from "react";
import { z } from "zod";
import { ChevronRight } from "../../../icons/chevron.js";
import { MailIcon } from "../../../icons/mail.js";
import { ls } from "../../strings.js";
import { Button } from "../../button.js";
import { Input } from "../../input.js";
import { useAuthContext } from "../context.js";
import type { AuthType } from "../types.js";
import { useSendEmailOtp } from "../../../hooks/useSendEmailOtp.js";

type EmailAuthProps = Extract<AuthType, { type: "email" }>;

// this is not used externally
// eslint-disable-next-line jsdoc/require-jsdoc
export const EmailAuth = memo(
  ({
    hideButton = false,
    buttonLabel = ls.login.email.button,
    placeholder = ls.login.email.placeholder,
  }: EmailAuthProps) => {
    const { setAuthStep } = useAuthContext();
    const { sendEmailOtp, isPending: isSendingEmailOtpPending } =
      useSendEmailOtp({
        mutation: {
          onMutate: (params) => {
            setAuthStep({ type: "otp_verify", email: params.email });
          },
          onError: (e) => {
            console.error(e);
            const error =
              e instanceof Error ? e : new Error("An Unknown error");
            setAuthStep({ type: "initial", error });
          },
        },
      });

    // TODO: support magic link email

    const form = useForm({
      defaultValues: {
        email: "",
      },
      onSubmit: async ({ value: { email } }) => {
        sendEmailOtp({ email });
      },
      validatorAdapter: zodValidator(),
    });

    return (
      <form
        className="w-full"
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
              onChange: z.string().email("Must provide a valid email."),
            }}
          >
            {(field) => (
              <Input
                name={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder={placeholder}
                type="email"
                iconLeft={<MailIcon />}
                iconRight={
                  hideButton ? (
                    <button
                      type="submit"
                      className="match-input cursor-pointer focus:outline-none focus:opacity-25"
                    >
                      <ChevronRight />
                    </button>
                  ) : undefined
                }
                disabled={isSendingEmailOtpPending}
              />
            )}
          </form.Field>
          <form.Subscribe
            selector={(state) => [
              state.canSubmit,
              state.isSubmitting,
              state.values.email,
            ]}
          >
            {([canSubmit, isSubmitting, email]) =>
              !hideButton ? (
                <Button
                  type="submit"
                  variant="primary"
                  disabled={Boolean(
                    isSendingEmailOtpPending ||
                      !canSubmit ||
                      isSubmitting ||
                      !email,
                  )}
                >
                  {buttonLabel}
                </Button>
              ) : null
            }
          </form.Subscribe>
        </div>
      </form>
    );
  },
);
