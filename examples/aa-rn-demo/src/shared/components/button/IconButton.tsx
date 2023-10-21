import * as React from "react";
import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";
import Icon, { type IconProps } from "react-native-dynamic-vector-icons";

export const IconButton = ({
  containerStyle,
  buttonsStyle,
  onPress,
  ...iconProps
}: {
  containerStyle?: StyleProp<ViewStyle>;
  buttonsStyle?: StyleProp<ViewStyle>;
} & IconProps) => {
  return (
    <View style={[containerStyle]}>
      <Pressable style={[buttonsStyle]} onPress={onPress}>
        <Icon {...iconProps} />
      </Pressable>
    </View>
  );
};
