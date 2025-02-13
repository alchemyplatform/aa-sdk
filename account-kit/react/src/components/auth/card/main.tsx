import { Fragment } from "react";
import { useAuthConfig } from "../../../hooks/internal/useAuthConfig.js";
import { Divider } from "../../divider.js";
import { useAuthContext } from "../context.js";
import { AuthSection } from "../sections/AuthSection.js";
import { GeneralError } from "./error/general-error.js";

export const MainAuthContent = () => {
  const { authStep } = useAuthContext();
  const isError = authStep.type === "initial" && authStep.error;
  const { header, sections, hideSignInText } = useAuthConfig(
    ({ header, sections, hideSignInText }) => ({
      header,
      sections,
      hideSignInText,
    })
  );

  return (
    <>
      {header}
      {!hideSignInText && <h3 className="font-semibold text-lg">Sign in</h3>}
      {isError && <GeneralError />}
      {sections?.map((section, idx) => {
        return (
          <Fragment key={`auth-section-fragment-${idx}`}>
            <AuthSection key={`auth-section-${idx}`} authTypes={section} />
            {idx !== sections.length - 1 ? (
              <Divider key={`divider-${idx}`} />
            ) : null}
          </Fragment>
        );
      })}
    </>
  );
};
