import { useConfig } from "@/app/state";
import { cn } from "@/lib/utils";
import {
  AuthCard,
  useSmartAccountClient,
  useUser,
  UseUserResult,
} from "@account-kit/react";
import { MintCard } from "../shared/MintCard";
import { LoadingIcon } from "../icons/loading";
import { EOAPostLogin } from "../shared/EOAPostLogin";

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
      <RenderContent user={user} hasClient={!!client} />
    </div>
  );
}

const RenderContent = ({
  user,
  hasClient,
}: {
  user: UseUserResult;
  hasClient: boolean;
}) => {
  const hasUser = !!user;

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
