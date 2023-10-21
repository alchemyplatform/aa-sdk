import { colors } from "@theme/color";
import React, { type ReactElement } from "react";
import { View, type ColorValue } from "react-native";

const ViewHorizontalDivider = ({
  height,
  color,
}: {
  height?: number;
  color?: ColorValue;
}): ReactElement => (
  <View
    style={{
      height: height ?? 1,
      backgroundColor: color ?? colors.black._90005,
    }}
  />
);

export default ViewHorizontalDivider;
