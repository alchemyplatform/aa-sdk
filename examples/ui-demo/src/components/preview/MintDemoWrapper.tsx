import { UserConnectionAvatarWithPopover } from "@/components/shared/user-connection-avatar/UserConnectionAvatarWithPopover";
import Image from "next/image";
import { CheckIcon } from "../icons/check";
import { GasIcon } from "../icons/gas";
import { DrawIcon } from "../icons/draw";
import { ReceiptIcon } from "../icons/receipt";

export function MintDemoWrapper() {
  return (
    <div>
      <div>
        <UserConnectionAvatarWithPopover deploymentStatus={true} />
      </div>
      <div>
        {
          // Rob
        }
      </div>
    </div>
  );
}
