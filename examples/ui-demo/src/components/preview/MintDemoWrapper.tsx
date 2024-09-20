import { UserConnectionAvatarWithPopover } from "@/components/shared/user-connection-avatar/UserConnectionAvatarWithPopover";

import { MintCard } from "../shared/MintCard";

export function MintDemoWrapper() {
  return (
    <div>
      <div>
        <UserConnectionAvatarWithPopover deploymentStatus={true} />
      </div>
      <div>
        <MintCard />
      </div>
    </div>
  );
}
