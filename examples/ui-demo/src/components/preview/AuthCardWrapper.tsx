import { useConfig } from "@/app/state";
import { cn } from "@/lib/utils";
import { AuthCard, useSmartAccountClient, useUser } from "@account-kit/react";
import { MintCard } from "../shared/MintCard";
import { LoadingIcon } from "../icons/loading";
import { EOAPostLogin } from "../shared/eoa-post-login/EOAPostLogin";

export function AuthCardWrapper({ className }: { className?: string }) {
  const { config } = useConfig();

  return (
    <div
      className={cn(
        "flex flex-1 flex-col justify-center items-center overflow-auto relative",
        config.ui.theme === "dark" ? "bg-black/70" : "bg-white",
        className
      )}
    >
      <RenderContent />
    </div>
  );
}

const RenderContent = () => {
  const user = useUser();
  const { client } = useSmartAccountClient({ type: "LightAccount" });

  const hasUser = !!user;
  const hasClient = !!client;

  if (!hasUser) {
    return (
      <div className="flex flex-col gap-2 w-[368px]">
        <div className="modal bg-surface-default shadow-md overflow-hidden">
          <AuthCard />
        </div>
      </div>
    );
  }

  const isEOAUser = user.type === "eoa";

  if (hasClient) {
    return <MintCard />;
  }

  if (isEOAUser) {
    return <EOAPostLogin />;
  }

  return <LoadingIcon />;
};
