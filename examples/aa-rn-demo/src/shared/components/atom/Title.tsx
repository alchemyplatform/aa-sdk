import { colors } from "@theme/color";
import React, { type ReactElement } from "react";
import { View } from "react-native";
import FormText from "./FormText";

const Title = ({ title }: { title: string }): ReactElement => {
  return (
    <View>
      <FormText
        style={{ marginVertical: 12, marginHorizontal: 20 }}
        color={colors.black._300}
      >
        {title}
      </FormText>
      <View style={{ height: 1, backgroundColor: colors.black._90005 }} />
    </View>
  );
};

export default Title;
