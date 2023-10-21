import { type ExtendedTheme } from "@react-navigation/native";
import { StyleSheet, type TextStyle, type ViewStyle } from "react-native";

interface Style {
  actionContainer: ViewStyle;
  button: ViewStyle;
  text: TextStyle;
}

export default (theme: ExtendedTheme) => {
  const { colors } = theme;
  return StyleSheet.create<Style>({
    actionContainer: {},
    button: {
      height: 36,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 7,
      paddingHorizontal: 12,
      borderRadius: 4,
      elevation: 3,
      backgroundColor: colors.primary,
    },
    text: {
      fontSize: 16,
      lineHeight: 21,
      fontWeight: "bold",
      letterSpacing: 0.25,
      color: colors.white,
    },
  });
};
