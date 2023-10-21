import { colors } from "@theme/color";
import {
  StyleSheet,
  type ImageStyle,
  type TextStyle,
  type ViewStyle,
} from "react-native";

interface Style {
  container: ViewStyle;
  titleTextStyle: TextStyle;
  buttonTextStyle: TextStyle;
  contentContainer: ViewStyle;
  listContainer: ViewStyle;
  profilePicImageStyle: ImageStyle;
}

export default () => {
  return StyleSheet.create<Style>({
    container: {
      flex: 1,
      alignItems: "center",
      backgroundColor: colors.white,
    },
    titleTextStyle: {
      fontSize: 32,
    },
    buttonTextStyle: {
      color: colors.white,
      fontWeight: "700",
    },
    contentContainer: {
      flex: 1,
    },
    listContainer: {},
    profilePicImageStyle: {
      height: 36,
      width: 36,
      borderRadius: 18,
    },
  });
};
