import { cn } from "@/lib/utils";
import { useConfig } from "@/src/app/state";
import { AuthCard, AuthType } from "@account-kit/react";
import { useMemo } from "react";
import { RADIUS_OPTION_TO_TAILWIND_CLASS } from "../configuration/consts";

export function AuthCardWrapper({ className }: { className?: string }) {
  const { config } = useConfig();

  const sections = useMemo<AuthType[][]>(() => {
    const output = [];
    if (config.auth.showEmail) {
      output.push([{ type: "email" as const }]);
    }

    output.push([{ type: "passkey" as const }]);

    return output;
  }, [config.auth]);

  return (
    <div
      className={cn(
        "flex flex-1 flex-col justify-center items-center overflow-auto",
        className
      )}
      style={{
        backgroundImage: "url(/images/grid.png)",
        backgroundSize: "100px",
        backgroundRepeat: "repeat",
      }}
    >
      <div className="flex flex-col w-[368px]">
        <AuthCard
          className={cn("shadow-md", RADIUS_OPTION_TO_TAILWIND_CLASS[config.ui.borderRadius])}
          header={<AuthCardHeader />}
          showSignInText
          showNavigation
          sections={sections}
        />
      </div>
    </div>
  );
}

function AuthCardHeader() {
  const {
    config: {
      ui: { logoDark, logoLight, theme },
    },
  } = useConfig();

  const logo = theme === "dark" ? logoDark : logoLight;

  if (!logo) return null;

  return (
    <img
      style={{ height: "60px", objectFit: "contain" }}
      src={logo.fileSrc}
      alt={logo.fileName}
    />
  );
}
