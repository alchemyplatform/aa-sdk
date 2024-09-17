import Moebius from "@phun-ky/moebius";
import Avatar from "boring-avatars";
import { useDebounceEffect } from "@/utils/hooks/useDebounceEffect";
import { useState } from "react";

type UserAvatarProps = {
	address: string;
	primaryColor: string;
};

const BASE_COLOR = "#37BCFA";
const UserAvatar = ({ address, primaryColor }: UserAvatarProps) => {
	const [avatarColors, setAvatarColors] = useState<string[]>([]);

	const getMoebiusColors = async (): Promise<string[]> => {
		const { MoebiusColor, MoebiusPalettes } = await Moebius();

		const palette = new MoebiusPalettes({
			baseColor: new MoebiusColor(BASE_COLOR, "primary"),
			secondaryColor: new MoebiusColor(primaryColor, "secondary"),
			diverging: true,
			bezier: true,
		});

		return palette.colors.interpolate as string[];
	};

	useDebounceEffect(
		() => {
			getMoebiusColors().then((moebius: string[]) => {
				setAvatarColors(moebius);
			});
		},
		[primaryColor],
		2000
	);

	return (
		<Avatar
			size={40}
			name={address}
			variant="marble"
			colors={avatarColors.length > 0 ? avatarColors : [primaryColor]}
		/>
	);
};

export { UserAvatar };
