import { type UseCollectionsReturn } from "@hooks/useCollections";
import FormText from "@shared-components/atom/FormText";
import Indicator from "@shared-components/atom/Indicator";
import React, { type ReactElement } from "react";
import { StyleSheet, View } from "react-native";

const ProfileFooter = (ret: UseCollectionsReturn): ReactElement => {
  return (
    <View style={[styles.footer]}>
      {ret.loading ? (
        <Indicator />
      ) : ret.items.length === 0 ? (
        <FormText style={styles.text}>No NFTs yet</FormText>
      ) : !ret.hasNextPage ? (
        <FormText style={styles.text}>End of List</FormText>
      ) : null}
    </View>
  );
};

export default ProfileFooter;

const styles = StyleSheet.create({
  footer: {
    flex: 1,
    justifyContent: "center",
    gap: 20,
    padding: 10,
    height: 70,
    paddingHorizontal: 8,
  },
  text: {
    color: "gray",
    textAlign: "center",
  },
});
