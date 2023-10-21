import { colors } from "@theme/color";
import React, { type ReactElement } from "react";
import { View } from "react-native";

const RadioIcon = ({ selected }: { selected: boolean }): ReactElement => (
  <View
    style={{
      borderColor: colors.primary._400,
      borderWidth: selected ? 5 : 1,
      borderRadius: 999,
      width: 16,
      height: 16,
    }}
  />
);

export default RadioIcon;
