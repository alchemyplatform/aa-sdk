import React, { type ReactElement } from "react";
import * as NavigationService from "react-navigation-helpers";

import { useAppNavigation } from "@hooks/useAppNavigation";
import Container from "@shared-components/atom/Container";
import Header from "@shared-components/atom/Header";
import { StyleSheet } from "react-native";
import NftDetails from "./NftDetails";

const DetailScreen = (): ReactElement => {
  const { params } = useAppNavigation();
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
    </Container>
  );
};

export default DetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
});
