import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { memo, useEffect } from "react";
import { z } from "zod";
import { useAuthenticate } from "../../../hooks/useAuthenticate.js";
import { useSigner } from "../../../hooks/useSigner.js";
import { ChevronRight } from "../../../icons/chevron.js";
import { MailIcon } from "../../../icons/mail.js";
import { ls } from "../../../strings.js";
import { Button } from "../../button.js";
import { IS_SIGNUP_QP } from "../../constants.js";
import { Input } from "../../input.js";
import { useAuthContext } from "../context.js";
import type { AuthType } from "../types.js";
import { useSignerStatus } from "../../../hooks/useSignerStatus.js";
import { AlchemySignerStatus, MfaRequiredError } from "@account-kit/signer";

type EmailAuthProps = Extract<AuthType, { type: "email" }>;

// this is not used externally
// eslint-disable-next-line jsdoc/require-jsdoc
export const EmailAuth = memo(
  ({
    emailMode: legacyEmailMode,
    hideButton = false,
    buttonLabel = ls.login.email.button,
    placeholder = ls.login.email.placeholder,
  }: EmailAuthProps) => {
    const { status } = useSignerStatus();
    const { setAuthStep } = useAuthContext();
    const signer = useSigner();
    const { authenticate, isPending } = useAuthenticate({
      onMutate: async (params) => {
        const cfg = await signer?.getConfig();
        if (params.type === "email" && "email" in params) {
          const emailMode = cfg?.email.mode
            ? cfg?.email.mode
            : params.emailMode === "magicLink"
            ? "MAGIC_LINK"
            : "OTP";

          if (emailMode === "OTP") {
            setAuthStep({ type: "otp_verify", email: params.email });
          }
        }
      },
      onSuccess: async (_data, params) => {
        const cfg = await signer?.getConfig();
        if (params.type === "email" && "email" in params) {
          const emailMode = cfg?.email.mode
            ? cfg?.email.mode
            : params.emailMode === "magicLink"
            ? "MAGIC_LINK"
            : "OTP";

          if (emailMode === "MAGIC_LINK") {
            setAuthStep({ type: "email_verify", email: params.email });
            return;
          }
        }
      },
      onError: (e, params) => {
        console.error(e);
        if (e instanceof MfaRequiredError && "email" in params) {
          const { multiFactorId } = e.multiFactors[0];
          setAuthStep({
            type: "totp_verify",
            previousStep: "magicLink",
            factorId: multiFactorId,
            email: params.email,
          });
          return;
        }

        const error = e instanceof Error ? e : new Error("An Unknown error");
        setAuthStep({ type: "initial", error });
      },
    });

    const form = useForm({
      defaultValues: {
        email: "",
      },
      onSubmit: async ({ value: { email } }) => {
        const existingUser = await signer?.getUser(email);
        const redirectParams = new URLSearchParams();

        if (existingUser == null) {
          redirectParams.set(IS_SIGNUP_QP, "true");
        }

        authenticate({
          type: "email",
          email,
          emailMode: legacyEmailMode,
          redirectParams,
        });
      },
      validatorAdapter: zodValidator(),
    });

    useEffect(() => {
      if (status === AlchemySignerStatus.AWAITING_EMAIL_AUTH) {
        setAuthStep({ type: "email_verify", email: form.state.values.email });
      }
    }, [status]);

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
                disabled={isPending}
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
                    isPending || !canSubmit || isSubmitting || !email
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
  }
);
