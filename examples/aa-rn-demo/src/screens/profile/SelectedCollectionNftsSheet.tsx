import React, { useMemo, type ReactElement } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import * as NavigationService from "react-navigation-helpers";

import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import useNfts from "@hooks/useNfts";
import FormBottomSheet from "@shared-components/atom/FormBottomSheet";
import FormImage from "@shared-components/atom/FormImage";
import FormText from "@shared-components/atom/FormText";
import Indicator from "@shared-components/atom/Indicator";
import { type ContractForOwner } from "alchemy-sdk";
import { Routes } from "types/navigation";
import { type Hex } from "viem";

const SelectedCollectionNftsSheet = ({
  address,
  selectedCollectionNft,
  onClose,
}: {
  address: Hex;
  selectedCollectionNft: ContractForOwner;
  onClose: () => void;
}): ReactElement => {
  const snapPoints = useMemo(() => ["80%"], []);
  const size = useWindowDimensions();
  const dim = size.width / 3.0 - 18;

  const { items, loading, fetchNextPage, hasNextPage } = useNfts({
    owner: address,
    contract: selectedCollectionNft.address as Hex,
  });

  if (loading) {
    return <Indicator />;
  }

  const listHeaderComponent = (
    <FormText font={"B"} style={{ marginBottom: 12, marginStart: 6 }}>
      {selectedCollectionNft.name}
    </FormText>
  );

  const listFooterComponent = (
    <View style={{ paddingTop: 16 }}>
      {loading ? (
        <Indicator />
      ) : items.length === 0 ? (
        <Text style={styles.text}>No tokens to show</Text>
      ) : (
        <Text style={styles.text}>End of List</Text>
      )}
    </View>
  );

  return (
    <FormBottomSheet
      showBottomSheet={true}
      snapPoints={snapPoints}
      onClose={onClose}
    >
      <View style={{ flex: 1 }}>
        <View style={styles.body}>
          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/* @ts-ignore */}
          <BottomSheetFlatList
            data={items}
            ListHeaderComponent={listHeaderComponent}
            ListFooterComponent={listFooterComponent}
            keyExtractor={(_, index): string => `user-ft-list-${index}`}
            initialNumToRender={10}
            contentContainerStyle={{ rowGap: 0 }}
            numColumns={3}
            onEndReached={(): void => {
              if (hasNextPage) {
                fetchNextPage();
              }
            }}
            renderItem={({ item }): ReactElement => (
              <TouchableOpacity
                onPress={(): void => {
                  NavigationService.push(Routes.Detail, { item });
                }}
              >
                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    margin: 2,
                  }}
                >
                  <FormImage
                    source={{
                      uri:
                        item.media.length > 0
                          ? item.media[0].thumbnail ?? item.media[0].raw
                          : undefined,
                    }}
                    size={dim}
                    style={{
                      maxWidth: dim,
                    }}
                  />
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </FormBottomSheet>
  );
};

export default SelectedCollectionNftsSheet;

const styles = StyleSheet.create({
  body: { flex: 1, padding: 20, backgroundColor: "white", gap: 20 },
  text: {
    color: "gray",
    fontSize: 12,
    textAlign: "center",
  },
});
