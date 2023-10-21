import { colors } from "@theme/color";
import React, { type ReactElement } from "react";
import { StyleSheet, View } from "react-native";
import FormText from "./FormText";

const NoResult = (): ReactElement => (
  <View style={styles.container}>
    <FormText color={colors.black._400}>{"No result"}</FormText>
  </View>
);

const styles = StyleSheet.create({
  container: {
    margin: 20,
  },
});

export default NoResult;
