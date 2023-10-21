import FormText from "@shared-components/atom/FormText";
import { colors } from "@theme/color";
import React, { type ReactElement } from "react";
import { Platform, StyleSheet, Switch, View } from "react-native";

const SettingSwitchItem = (props: {
  name: string;
  value: boolean;
  toggle?: (value: boolean) => void;
}): ReactElement => {
  const { name, value, toggle } = props;
  return (
    <View style={styles.item}>
      <FormText color={colors.black._900}>{name}</FormText>
      <Switch
        style={Platform.select({
          ios: {
            transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }],
          },
        })}
        value={value}
        onValueChange={toggle}
      />
    </View>
  );
};

export default SettingSwitchItem;

const styles = StyleSheet.create({
  item: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
