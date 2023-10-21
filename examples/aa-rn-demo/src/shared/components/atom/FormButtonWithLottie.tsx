import { colors } from "@theme/color";
import Lottie from "lottie-react-native";
import React, { type ReactElement } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
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
  leftIcon?: string;
  leftIconSize?: number;
};

const FormButtonWithLottie = ({
  children,
  disabled,
  onPress,
  figure = "primary",
  font = "R",
  size = "md",
  containerStyle,
  textStyle,
  leftIcon,
  leftIconSize,
}: FormButtonProps): ReactElement => {
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
      {leftIcon && (
        <Lottie
          source={leftIcon}
          style={{
            width: leftIconSize,
            height: leftIconSize,
            alignSelf: "center",
          }}
          autoPlay
          loop
        />
      )}
      <FormText
        font={font}
        size={size === "sm" ? 14 : 16}
        style={[{ color: fontColor }, textStyle]}
      >
        {children}
      </FormText>
    </TouchableOpacity>
  );
};

export default FormButtonWithLottie;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    paddingHorizontal: 10,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
  },
});
