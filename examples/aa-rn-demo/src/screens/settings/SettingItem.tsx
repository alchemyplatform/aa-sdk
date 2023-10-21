import FormText from "@shared-components/atom/FormText";
import { colors } from "@theme/color";
import React, { type ReactElement } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import Icon, { IconType } from "react-native-dynamic-vector-icons";

const SettingItem = (props: {
  name: string;
  onPress?: () => void;
}): ReactElement => {
  const { name, onPress } = props;

  return (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <FormText color={colors.black._900}>{name}</FormText>
      <Icon
        type={IconType.FontAwesome5}
        name="chevron-right"
        color={colors.black._300}
        size={20}
      />
    </TouchableOpacity>
  );
};

export default SettingItem;

const styles = StyleSheet.create({
  item: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
