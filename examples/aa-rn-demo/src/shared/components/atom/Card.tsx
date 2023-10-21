import React, { type ReactElement } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";

const Card = (
  props: ViewProps & { borderRound?: boolean; center?: boolean },
): ReactElement => {
  const { style, borderRound, center, ...rest } = props;
  return (
    <View
      style={[
        styles.container,
        center ? styles.center : {},
        borderRound ? styles.borderRound : {},
        style,
      ]}
      {...rest}
    />
  );
};

export default Card;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "white",
  },
  borderRound: {
    borderRadius: 20,
  },
  center: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
