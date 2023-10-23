import FormImage from "@shared-components/atom/FormImage";
import FormText from "@shared-components/atom/FormText";
import Row from "@shared-components/atom/Row";
import ViewHorizontalDivider from "@shared-components/atom/ViewHorizontalDivider";
import { convertTimestampToDate } from "@shared-utils";
import { colors } from "@theme/color";
import { BigNumber, type OwnedNft } from "alchemy-sdk";
import React, { type ReactElement } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import NftAttributes, { type NftAttributesType } from "./NftAttributes";

const NftDetails = ({ item }: { item: OwnedNft }): ReactElement => {
  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        <View style={styles.body}>
          <View style={{ paddingBottom: 20, rowGap: 12 }}>
            <Row style={{ columnGap: 6 }}>
              {item.title && (
                <FormText size={18} font={"B"}>{`${item.title}`}</FormText>
              )}
              {item.tokenId && (
                <FormText size={16}>{`Token ID: ${item.tokenId}`}</FormText>
              )}
              {item.tokenType && (
                <FormText size={16}>{`(${item.tokenType})`}</FormText>
              )}
            </Row>
            {item.acquiredAt?.blockTimestamp && (
              <FormText font={"R"} color={colors.black._700}>
                {convertTimestampToDate(
                  BigNumber.from(item.acquiredAt.blockTimestamp),
                )}
              </FormText>
            )}
            <FormText font={"R"}>{item.description}</FormText>
          </View>

          <View style={styles.imageBox}>
            <FormImage
              size={350}
              source={
                item.media.length > 0
                  ? { uri: item.media[0].thumbnail ?? item.media[0].raw }
                  : require("../../assets/images/nft-placeholder.png")
              }
            />
          </View>
          <View>
            <View style={styles.info}>
              {item.rawMetadata?.external_url && (
                <>
                  <FormText font={"B"} size={16}>
                    Token URI
                  </FormText>
                  <FormText color={colors.black._900}>
                    {item.rawMetadata.external_url}
                  </FormText>
                  <ViewHorizontalDivider />
                </>
              )}
            </View>
            {item.rawMetadata?.attributes && (
              <>
                <View style={styles.info}>
                  <FormText font={"B"} size={16}>
                    Attributes
                  </FormText>
                </View>
                <NftAttributes
                  attributes={
                    item.rawMetadata.attributes as NftAttributesType[]
                  }
                />
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default NftDetails;

const styles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: "space-between",
    padding: 20,
  },
  imageBox: {
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 12,
    alignItems: "center",
    height: 300,
  },
  info: {
    padding: 4,
    marginVertical: 8,
  },
});
