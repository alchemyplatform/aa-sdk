import { Fragment } from "react";
import { Divider } from "../../divider.js";
import { PoweredBy } from "../../poweredby.js";
import { AuthSection } from "../sections/AuthSection.js";
import type { AuthCardProps } from "./index.js";

// eslint-disable-next-line jsdoc/require-jsdoc
export const MainAuthContent = ({ header = null, sections }: AuthCardProps) => {
  return (
    <>
      {header}
      <h3 className="font-bold text-lg">Sign in</h3>
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
      <div className="flex flex-col w-full items-center text-xs gap-3">
        <span className="text-fg-tertiary text-center">
          By signing in, you agree to the{" "}
          <a
            className="text-fg-accent-brand cursor-pointer underline"
            href="https://www.alchemy.com/terms-conditions/end-user-terms"
          >
            Terms of Service
          </a>
        </span>
        <PoweredBy />
      </div>
    </>
  );
};
