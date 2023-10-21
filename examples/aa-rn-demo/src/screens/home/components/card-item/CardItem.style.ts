import { ScreenWidth } from "@freakycoder/react-native-helpers";
import { colors } from "@theme/color";
import { StyleSheet, type TextStyle, type ViewStyle } from "react-native";

interface Style {
  container: ViewStyle;
  descriptionTextStyle: TextStyle;
  contentContainer: ViewStyle;
  valueTextStyle: TextStyle;
}

export default () => {
  return StyleSheet.create<Style>({
    container: {
      padding: 16,
      marginTop: 16,
      borderWidth: 1,
      borderRadius: 8,
      width: ScreenWidth * 0.9,
      borderColor: colors.black._500,
    },
    descriptionTextStyle: {
      marginTop: 8,
    },
    contentContainer: {
      margin: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    valueTextStyle: {
      marginLeft: 8,
    },
  });
};
