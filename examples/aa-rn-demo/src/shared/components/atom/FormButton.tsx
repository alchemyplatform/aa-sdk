import React, { type ReactElement } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  type ColorValue,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { useTheme } from "@react-navigation/native";
import Icon, { IconType } from "react-native-dynamic-vector-icons";
import FormText from "./FormText";

export type FormButtonProps = {
  children: string;
  disabled?: boolean;
  onPress?: () => void;
  figure?: "primary" | "outline" | "error";
  size?: "sm" | "md" | "lg";
  font?: "B" | "R" | "SB";
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  rightIcon?: string;
  rightIconSize?: number;
  rightIconColor?: ColorValue;
};

const FormButton = ({
  children,
  disabled,
  onPress,
  figure = "primary",
  font = "R",
  size = "md",
  containerStyle,
  textStyle,
  rightIcon,
  rightIconSize,
  rightIconColor,
}: FormButtonProps): ReactElement => {
  const theme = useTheme();
  const { colors } = theme;

  let mainColor = colors.primary._400;
  if (figure === "error") {
    mainColor = "#F84F4F";
  }

  const paddingVertical = size === "md" ? 8 : size === "lg" ? 11 : 5;
  const fontColor = figure === "outline" ? mainColor : "white";
  const backgroundColor = disabled
    ? colors.black._200
    : figure === "outline"
    ? "white"
    : mainColor;
  const borderColor = disabled ? colors.black._200 : mainColor;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor,
          paddingVertical,
          borderColor,
        },
        containerStyle,
      ]}
      disabled={disabled}
      onPress={onPress}
    >
      <FormText
        font={font}
        size={size === "sm" ? 14 : 16}
        style={[{ color: fontColor }, textStyle]}
      >
        {children}
      </FormText>
      {rightIcon && (
        <Icon
          name={rightIcon}
          type={IconType.FontAwesome5}
          size={rightIconSize || 14}
          color={rightIconColor || colors.black._300}
        />
      )}
    </TouchableOpacity>
  );
};

export default FormButton;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    paddingHorizontal: 10,
    borderWidth: 1,
  },
});
