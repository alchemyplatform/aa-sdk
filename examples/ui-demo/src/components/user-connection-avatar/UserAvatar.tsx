"use client";

import Avatar from "boring-avatars";
import { useMemo } from "react";

type UserAvatarProps = {
  address: string;
  primaryColor: string;
};

const SUB_COLORS = ["#37BCFA", "#6D37FA"];

const UserAvatar = ({ address, primaryColor }: UserAvatarProps) => {
  const avatarColors = useMemo(() => {
    return shuffleColorsDeterministically(
      [primaryColor, ...SUB_COLORS],
      address
    );
  }, [address, primaryColor]);

  return (
    <Avatar size={40} name={address} variant="marble" colors={avatarColors} />
  );
};

// Always returns the same colors for the same seed, so
// that rendering on the server and client will match.
const shuffleColorsDeterministically = (colors: string[], seed: string) => {
  if (colors.length === 1) {
    return colors;
  }
  const hash = Array.from(seed).reduce(
    (acc, char) => acc + char.charCodeAt(0),
    0
  );
  return [...colors].sort(
    (a, b) => (hash % a.charCodeAt(0)) - (hash % b.charCodeAt(0))
  );
};

export { UserAvatar };
