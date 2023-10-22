import React, { useState, type ReactElement } from "react";
import {
  FlatList,
  Platform,
  RefreshControl,
  type ListRenderItemInfo,
} from "react-native";
/**
 * ? Local Imports
 */
import { useWalletContext } from "@context/wallet";
import useCollections from "@hooks/useCollections";
import Container from "@shared-components/atom/Container";
import { type ContractForOwner } from "alchemy-sdk";
import ProfileCollectionNft from "./ProfileCollectionNft";
import ProfileFooter from "./ProfileFooter";
import ProfileHeader from "./ProfileHeader";
import SelectedCollectionNftsSheet from "./SelectedCollectionNftsSheet";

interface ProfileScreenProps {}

const ProfileScreen: React.FC<ProfileScreenProps> = () => {
  const { scaAddress: address } = useWalletContext();
  const useCollectionsRet = useCollections({
    owner: address,
  });
  const { isRefetching, remove, refetch, fetchNextPage, items, hasNextPage } =
    useCollectionsRet;

  const profileHeader = <ProfileHeader />;

  const profileFooter = <ProfileFooter {...useCollectionsRet} />;

  const [selectedCollectionNft, setSelectedCollectionNft] =
    useState<ContractForOwner | null>(null);

  return (
    <Container
      style={{ marginBottom: Platform.select({ ios: -30 }) }}
      safeArea={false}
    >
      <FlatList
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={(): void => {
              remove();
              refetch();
            }}
          />
        }
        ListHeaderComponent={profileHeader}
        ListFooterComponent={profileFooter}
        data={items}
        keyExtractor={(item: ContractForOwner): string =>
          `${address}:${item.address}`
        }
        onEndReached={(): void => {
          if (hasNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        initialNumToRender={10}
        numColumns={2}
        contentContainerStyle={{ gap: 4 }}
        columnWrapperStyle={{ gap: 8 }}
        renderItem={({
          item,
        }: ListRenderItemInfo<ContractForOwner>): ReactElement => {
          return (
            <ProfileCollectionNft
              collection={item}
              onSelect={(): void => setSelectedCollectionNft(item)}
            />
          );
        }}
      />

      {address && selectedCollectionNft && (
        <SelectedCollectionNftsSheet
          address={address}
          selectedCollectionNft={selectedCollectionNft}
          onClose={(): void => setSelectedCollectionNft(null)}
        />
      )}
    </Container>
  );
};

export default ProfileScreen;
