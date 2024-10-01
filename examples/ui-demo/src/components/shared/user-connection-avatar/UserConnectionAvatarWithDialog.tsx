import { useState } from "react";
import {
	Dialog,
	DialogTrigger,
	DialogContent,
} from "@/components/ui/dialog";
import { UserConnectionAvatar } from "@/components/shared/user-connection-avatar/UserConnectionAvatar";
import { UserConnectionDetails } from "@/components/shared/user-connection-avatar//UserConnectionDetails";

import { useConfig } from "@/app/state";
import { cn } from "@/lib/utils";

export const UserConnectionAvatarWithDialog = () => {
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const { config } = useConfig();

	const theme = config.ui.theme;

	return (
		<Dialog
			open={isDialogOpen}
			onOpenChange={(open: boolean) => {
				setIsDialogOpen(open);
			}}
		>
			<DialogTrigger>
				<UserConnectionAvatar isFocused={isDialogOpen} />
			</DialogTrigger>
			<DialogContent
				onOpenAutoFocus={(e) => e.preventDefault()}
				onCloseAutoFocus={(e) => e.preventDefault()}
				className={cn(
					"border border-solid border-[#E2E8F0] min-w-[274px] bg-bg-surface-default",
					theme === "dark" && "border-[#374141]"
				)}
			>
				<UserConnectionDetails />
			</DialogContent>
		</Dialog>
	);
};
