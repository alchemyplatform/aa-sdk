import React, { type ReactElement } from "react";
import { StyleSheet, View } from "react-native";

import Container from "./Container";
import Indicator from "./Indicator";

const LoadingPage = (): ReactElement => {
  return (
    <Container style={styles.container}>
      <View style={styles.body}>
        <Indicator />
      </View>
    </Container>
  );
};

export default LoadingPage;

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: {
    flex: 1,
    gap: 20,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
