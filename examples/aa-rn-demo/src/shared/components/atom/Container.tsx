import React, { type ReactElement, type ReactNode } from "react";
import {
  ScrollView,
  View,
  type ColorValue,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import KeyboardAvoidingView from "./KeyboardAvoidingView";

const ContainerComponent = ({
  style,
  children,
  keyboardAvoiding,
  scrollable,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  keyboardAvoiding?: boolean;
  scrollable?: boolean;
}): ReactElement => {
  return (
    <>
      {keyboardAvoiding ? (
        <KeyboardAvoidingView>
          <View style={style}>{children}</View>
        </KeyboardAvoidingView>
      ) : scrollable ? (
        <ScrollView
          bounces={false}
          contentContainerStyle={{ flex: 1 }}
          contentInsetAdjustmentBehavior="always"
          overScrollMode="always"
          showsVerticalScrollIndicator={true}
        >
          <View style={style}>{children}</View>
        </ScrollView>
      ) : (
        <View style={style}>{children}</View>
      )}
    </>
  );
};

const Container = ({
  children,
  style,
  safeAreaBackgroundColor,
  keyboardAvoiding,
  scrollable,
  safeArea = true,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  safeAreaBackgroundColor?: ColorValue;
  keyboardAvoiding?: boolean;
  scrollable?: boolean;
  safeArea?: boolean;
}): ReactElement => {
  return safeArea ? (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: safeAreaBackgroundColor || "white" }}
    >
      <ContainerComponent
        style={style}
        scrollable={scrollable}
        keyboardAvoiding={keyboardAvoiding}
      >
        {children}
      </ContainerComponent>
    </SafeAreaView>
  ) : (
    <View
      style={{ flex: 1, backgroundColor: safeAreaBackgroundColor || "white" }}
    >
      <ContainerComponent
        style={style}
        scrollable={scrollable}
        keyboardAvoiding={keyboardAvoiding}
      >
        {children}
      </ContainerComponent>
    </View>
  );
};

export default Container;
