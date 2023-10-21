import { colors } from "@theme/color";
import React, { type ReactElement } from "react";
import { Text, type TextProps } from "react-native";
import FormText from "./FormText";

const FormHighlightText = ({
  text,
  highlight,
  ...rest
}: {
  text?: string;
  highlight?: string;
} & TextProps): ReactElement => {
  if (text === undefined || highlight === undefined) {
    return <FormText>{text}</FormText>;
  }

  const startIndex = text.toLowerCase().indexOf(highlight.toLowerCase());
  if (startIndex === -1) {
    return <FormText>{text}</FormText>;
  }

  const before = text.slice(0, startIndex);
  const find = text.slice(startIndex, startIndex + highlight.length);
  const after = text.slice(startIndex + highlight.length);

  return (
    <Text style={{ flexDirection: "row", flexWrap: "wrap" }} {...rest}>
      <FormText>{before}</FormText>
      <FormText font="B" color={colors.primary._400}>
        {find}
      </FormText>
      <FormText>{after}</FormText>
    </Text>
  );
};

export default FormHighlightText;
