"use client";

import { useAuthContext } from "../context.js";
import { EmailAuth } from "../sections/EmailAuth.js";
import { OtpAuth } from "../sections/OtpAuth.js";
import type { AuthType } from "../types.js";

export type AuthCardProps = {
  sections?: AuthType[][];
  className?: string;
};

export const AuthCard = ({ sections, className }: AuthCardProps) => {
  const { authStep } = useAuthContext();

  const renderStep = () => {
    switch (authStep.type) {
      case "initial":
        return (
          <div className="flex flex-col gap-4">
            {sections?.map((section, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                {section.map((authType, authIdx) => {
                  if (authType.type === "email") {
                    return <EmailAuth key={authIdx} {...authType} />;
                  }
                  return null;
                })}
              </div>
            ))}
          </div>
        );
      case "otp_verify":
        return <OtpAuth />;
      case "complete":
        return (
          <div className="text-center p-6">
            <p className="text-fg-primary">Authentication complete!</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`flex flex-col gap-4 p-6 ${className ?? ""}`}>
      {renderStep()}
    </div>
  );
};
