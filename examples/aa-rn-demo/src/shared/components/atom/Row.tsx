import React, { type ReactElement } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";

const Row = (props: ViewProps): ReactElement => {
  const { style, ...rest } = props;
  return <View style={[styles.container, style]} {...rest} />;
};

export default Row;

const styles = StyleSheet.create({
  container: { flexDirection: "row" },
});
