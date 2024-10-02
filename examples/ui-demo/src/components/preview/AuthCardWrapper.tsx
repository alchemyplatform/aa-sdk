import { useConfig } from "@/app/state";
import { cn } from "@/lib/utils";
import { AuthCard, useSmartAccountClient, useUser } from "@account-kit/react";
import { MintCard } from "../shared/MintCard";
import { LoadingIcon } from "../icons/loading";

export function AuthCardWrapper({ className }: { className?: string }) {
  const user = useUser();
  const { config } = useConfig();
  const { client } = useSmartAccountClient({ type: "LightAccount" });

  return (
    <div
      className={cn(
        "flex flex-1 flex-col justify-center items-center overflow-auto relative",
        config.ui.theme === "dark" ? "bg-black/70" : "bg-white",
        className
      )}
    >
      <RenderContent hasUser={!!user} hasClient={!!client} />
    </div>
  );
}

const RenderContent = ({
  hasUser,
  hasClient,
}: {
  hasUser: boolean;
  hasClient: boolean;
}) => {
  if (!hasUser) {
    return (
      <div className="flex flex-col gap-2 w-[368px]">
        <div className="modal bg-surface-default shadow-md overflow-hidden">
          <AuthCard />
        </div>
      </div>
    );
  }

  if (hasClient) {
    return <MintCard />;
  }

  return <LoadingIcon />;
};
