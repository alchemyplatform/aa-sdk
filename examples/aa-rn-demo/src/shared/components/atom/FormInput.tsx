import { getFontStyle } from "@shared-utils";
import { colors } from "@theme/color";
import React, { type ReactElement } from "react";
import { StyleSheet, TextInput, type TextInputProps } from "react-native";
import { type FontSize, type FontType } from "types/font";

const FormInput = (
  props: {
    inputRef?: React.LegacyRef<TextInput>;
    fontType?: FontType;
    font?: "R" | "B" | "SB";
    size?: FontSize;
    disabled?: boolean;
  } & TextInputProps,
): ReactElement => {
  const { style, font = "R", size = 14, ...rest } = props;
  const fontStyle = getFontStyle(`${font}.${size}` as FontType);
  const disabled = props.disabled ?? false;

  return (
    <TextInput
      editable={!disabled}
      selectTextOnFocus={!disabled}
      ref={props.inputRef}
      style={[
        { backgroundColor: disabled ? colors.black._50 : "white" },
        styles.container,
        style,
        fontStyle,
      ]}
      placeholderTextColor={colors.black._200}
      {...rest}
    />
  );
};

export default FormInput;

const styles = StyleSheet.create({
  container: {
    borderColor: colors.black._90010,
    borderRadius: 14,
    borderStyle: "solid",
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 14,
    height: 40,
  },
});
