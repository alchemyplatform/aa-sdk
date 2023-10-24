import React, { useState, type ReactElement } from "react";
import * as NavigationService from "react-navigation-helpers";

import { useAppNavigation } from "@hooks/useAppNavigation";
import Container from "@shared-components/atom/Container";
import Header from "@shared-components/atom/Header";
import { TouchableButton } from "@shared-components/button/TouchableButton";
import { StyleSheet } from "react-native";
import MintConfirmModal from "./MintConfirmModal";
import NftDetails from "./NftDetails";

const DetailScreen = (): ReactElement => {
  const { params } = useAppNavigation();
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  return (
    <Container style={styles.container}>
      <Header
        title={"NFT Info"}
        left="back"
        onPressLeft={() => {
          NavigationService.goBack();
        }}
      />
      <NftDetails item={params!.item} />
      <TouchableButton
        containerStyle={{ padding: 32 }}
        buttonsStyle={{ borderRadius: 24 }}
        disabled={showBottomSheet}
        handler={() => setShowBottomSheet(true)}
        title="Mint"
      />
      <MintConfirmModal
        item={params!.item}
        showBottomSheet={showBottomSheet}
        setShowBottomSheet={setShowBottomSheet}
      />
    </Container>
  );
};

export default DetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
});
