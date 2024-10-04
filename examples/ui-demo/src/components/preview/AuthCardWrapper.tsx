import { useConfig } from "@/app/state";
import { cn } from "@/lib/utils";
import { AuthCard, useSmartAccountClient, useUser } from "@account-kit/react";
import { MintCard } from "../shared/mint-card/MintCard";
import { LoadingIcon } from "../icons/loading";
import { EOAPostLogin } from "../shared/eoa-post-login/EOAPostLogin";

export function AuthCardWrapper({ className }: { className?: string }) {
  const { config } = useConfig();

  return (
    <div
      className={cn(
        "flex flex-col flex-1 overflow-y-auto scrollbar-none relative h-full w-full",
        config.ui.theme === "dark" ? "bg-black/70" : "bg-white",
        className
      )}
    >
      <div className="flex flex-1 justify-center items-center px-6">
        <RenderContent />
      </div>
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
      <div className="flex flex-col py-14 pt-20 gap-2 w-[368px]">
        <div className="modal bg-surface-default shadow-md overflow-hidden">
          <AuthCard />
        </div>
      </div>
    );
  }

  const isEOAUser = user.type === "eoa";

  if (hasClient) {
    return (
      <div className="py-14 pt-20">
        <MintCard />
      </div>
    );
  }

  if (isEOAUser) {
    return (
      <div className="py-14 pt-20">
        <EOAPostLogin />
      </div>
    );
  }

  return <LoadingIcon />;
};
