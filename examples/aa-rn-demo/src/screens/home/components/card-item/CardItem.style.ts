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
      paddingVertical: 24,
      paddingHorizontal: 32,
      marginTop: 16,
      borderWidth: 1,
      borderRadius: 16,
      width: ScreenWidth * 0.9,
      borderColor: colors.primary._100,
    },
    descriptionTextStyle: {
      marginTop: 8,
    },
    contentContainer: {
      borderRadius: 18,
      overflow: "hidden",
      alignItems: "center",
      height: 300,
      marginVertical: 16,
    },
    valueTextStyle: {
      marginLeft: 8,
    },
  });
};
