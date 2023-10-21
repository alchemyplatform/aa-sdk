import React, { type ReactElement } from "react";
import { StyleSheet, Text } from "react-native";

const ErrorMessage = ({ message }: { message: string }): ReactElement => {
  return message ? <Text style={styles.container}>{message}</Text> : <></>;
};

export default ErrorMessage;

const styles = StyleSheet.create({
  container: {
    color: "red",
  },
});
