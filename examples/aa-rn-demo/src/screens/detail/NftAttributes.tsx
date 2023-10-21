import FormText from "@shared-components/atom/FormText";
import Row from "@shared-components/atom/Row";
import { colors } from "@theme/color";
import _ from "lodash";
import React, { type ReactElement } from "react";
import { FlatList, StyleSheet, View } from "react-native";

export type NftAttributesType = {
  trait_type: string;
  value: string;
};

const NftAttributes = ({
  attributes,
}: {
  attributes: NftAttributesType[];
}): ReactElement => {
  return (
    <Row style={styles.traitsBox}>
      <FlatList
        data={attributes}
        keyExtractor={(_item, index): string => `attributes-${index}`}
        contentContainerStyle={{ gap: 8 }}
        renderItem={({ item, index }): ReactElement => (
          <View style={styles.traits} key={`${item.trait_type}-${index}`}>
            <FormText font={"B"} size={16}>
              {item.trait_type}
            </FormText>
            <FormText color={colors.black._900}>
              {_.toString(item.value)}
            </FormText>
          </View>
        )}
      />
    </Row>
  );
};

export default NftAttributes;

const styles = StyleSheet.create({
  traitsBox: {
    columnGap: 10,
    flex: 1,
    width: "100%",
  },
  traits: {
    rowGap: 4,
    backgroundColor: "white",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderColor: colors.black._10,
    borderWidth: 1,
  },
});
