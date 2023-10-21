import { useTheme } from "@react-navigation/native";
import * as React from "react";
import {
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import createStyles from "./Button.style";

export const TouchableButton = (props: {
  handler: () => void;
  title: string;
  containerStyle?: StyleProp<ViewStyle>;
  buttonsStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
}) => {
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={[styles.actionContainer, props.containerStyle]}>
      <TouchableOpacity
        style={[
          styles.button,
          props.buttonsStyle,
          props.disabled ? { opacity: 0.5 } : {},
        ]}
        disabled={props.disabled}
        onPress={() => props.handler()}
      >
        <Text style={[styles.text, props.textStyle]}>{props.title}</Text>
      </TouchableOpacity>
    </View>
  );
};
