import Card from "@shared-components/atom/Card";
import FormImage from "@shared-components/atom/FormImage";
import FormText from "@shared-components/atom/FormText";
import { truncate } from "@shared-utils";
import { colors } from "@theme/color";
import { type ContractForOwner } from "alchemy-sdk";
import React, { type ReactElement } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Icon, { IconType } from "react-native-dynamic-vector-icons";

const ProfileCollectionNft = ({
  collection,
  onSelect,
}: {
  collection: ContractForOwner;
  onSelect: () => void;
}): ReactElement => {
  const size = useWindowDimensions();
  const dim = size.width / 2.0 - 6;

  const headerText: string = `${
    collection.name ?? collection.symbol ?? truncate(collection.address)
  }`;

  const preview: string | undefined =
    collection.media.length > 0
      ? collection.media[0].thumbnail ?? collection.media[0].raw
      : undefined;

  return (
    <TouchableOpacity onPress={onSelect}>
      <View
        style={[styles.container, { width: dim, height: dim, maxWidth: dim }]}
      >
        {preview ? (
          <FormImage
            source={{
              uri: preview,
            }}
            size={150}
            style={{ borderRadius: 12 }}
          />
        ) : (
          <Card
            borderRound={true}
            style={[
              styles.container,
              { width: dim, height: dim, maxWidth: dim },
            ]}
          >
            <Icon
              type={IconType.FontAwesome5}
              name={"exclamation-triangle"}
              size={24}
              color={colors.primary._300}
            />
          </Card>
        )}
        <View style={styles.headerTextBox}>
          <FormText
            font={"B"}
            style={styles.headerText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {headerText}
          </FormText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ProfileCollectionNft;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: 2,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  headerTextBox: {
    borderRadius: 16,
    backgroundColor: `${colors.black._900}${colors.opacity._30}`,
    bottom: 6,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    paddingHorizontal: 8,
    flex: 1,
    width: "95%",
  },
  headerText: {
    color: colors.white,
  },
});
