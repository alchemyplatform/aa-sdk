import Avatar from "boring-avatars";
import { useMemo } from "react";

type UserAvatarProps = {
  address: string;
  primaryColor: string;
};

const SUB_COLORS = ["#37BCFA", "#6D37FA"];

const UserAvatar = ({ address, primaryColor }: UserAvatarProps) => {
  const avatarColors = useMemo(() => {
    return shuffleColors([primaryColor, ...SUB_COLORS]);
  }, [primaryColor]);

  return (
    <Avatar
      size={40}
      name={address}
      variant="marble"
      colors={avatarColors.length > 0 ? avatarColors : [primaryColor]}
    />
  );
};

const shuffleColors = (colors: string[]) => {
  return colors.sort(() => Math.random() - 0.5);
};

export { UserAvatar };
