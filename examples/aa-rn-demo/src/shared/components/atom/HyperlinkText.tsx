import React, { type ReactElement } from "react";
import {
  Linking,
  StyleSheet,
  TouchableOpacity,
  type StyleProp,
  type TextStyle,
} from "react-native";
import FormText from "./FormText";

const HyperlinkText = ({
  url,
  text,
  style,
}: {
  url: string;
  text: string;
  style?: StyleProp<TextStyle>;
}): ReactElement => {
  const handlePress = (): Promise<void> => Linking.openURL(url);

  return (
    <TouchableOpacity onPress={handlePress}>
      <FormText style={[styles.linkText, style]}>{text}</FormText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  linkText: {
    textDecorationLine: "underline",
  },
});

export default HyperlinkText;
