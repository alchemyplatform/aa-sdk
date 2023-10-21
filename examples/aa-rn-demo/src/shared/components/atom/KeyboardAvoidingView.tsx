import React, { useCallback, type ReactElement, type ReactNode } from "react";
import {
  Platform,
  ScrollView,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { AvoidSoftInput } from "react-native-avoid-softinput";

import { useFocusEffect } from "@react-navigation/native";

1;
const KeyboardAvoidingView = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}): ReactElement => {
  const onFocusEffect = useCallback(() => {
    Platform.OS === "ios" && AvoidSoftInput.setAdjustNothing();
    AvoidSoftInput.setEnabled(true);
    return () => {
      AvoidSoftInput.setEnabled(false);
      AvoidSoftInput.setDefaultAppSoftInputMode();
    };
  }, []);

  useFocusEffect(onFocusEffect);

  return (
    <ScrollView
      bounces={false}
      contentContainerStyle={{ flex: 1 }}
      contentInsetAdjustmentBehavior="always"
      overScrollMode="always"
      showsVerticalScrollIndicator={true}
      style={style}
    >
      {children}
    </ScrollView>
  );
};

export default KeyboardAvoidingView;
