import { Fragment } from "react";
import { useUiConfig } from "../../../hooks/useUiConfig.js";
import { Divider } from "../../divider.js";
import { AuthSection } from "../sections/AuthSection.js";
import { GeneralError } from "./error/general-error.js";
import { type AuthStep } from "../context.js";

type MainAuthContentProps = {
  authStep: AuthStep;
};

// eslint-disable-next-line jsdoc/require-jsdoc
export const MainAuthContent = ({ authStep }: MainAuthContentProps) => {
  const isError = authStep.type === "initial" && authStep.error;
  const {
    auth: { header, sections, hideSignInText },
  } = useUiConfig();

  return (
    <>
      {header}
      {!hideSignInText && <h3 className="font-semibold text-lg">Sign in</h3>}
      {isError && <GeneralError />}
      {sections?.map((section, idx) => {
        return (
          <Fragment key={`auth-section-fragment-${idx}`}>
            <AuthSection key={`auth-section-${idx}`} authTypes={section} />
            {idx === 0 ? <Divider key={`divider-${idx}`} /> : null}
          </Fragment>
        );
      })}
    </>
  );
};
