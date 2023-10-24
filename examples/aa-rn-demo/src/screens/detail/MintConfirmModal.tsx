import { ERC721Abi } from "@abi/ERC721";
import { useAlertContext } from "@context/alert";
import { useWalletContext } from "@context/wallet";
import usePostTx from "@hooks/contract/usePostTx";
import type { ICardItem } from "@models";
import FormBottomSheet from "@shared-components/atom/FormBottomSheet";
import FormButton from "@shared-components/atom/FormButton";
import FormImage from "@shared-components/atom/FormImage";
import FormText from "@shared-components/atom/FormText";
import Row from "@shared-components/atom/Row";
import { truncate } from "@shared-utils";
import { colors } from "@theme/color";
import type { OwnedNft } from "alchemy-sdk";
import React, { type ReactElement } from "react";
import { StyleSheet, View } from "react-native";
import Icon, { IconType } from "react-native-dynamic-vector-icons";
import { encodeFunctionData, formatEther, parseEther, type Hex } from "viem";

const MintConfirmModal = ({
  item,
  showBottomSheet,
  setShowBottomSheet,
}: {
  item: OwnedNft | ICardItem;
  showBottomSheet: boolean;
  setShowBottomSheet: React.Dispatch<React.SetStateAction<boolean>>;
}): ReactElement => {
  const { scaAddress } = useWalletContext();
  const { dispatchAlert } = useAlertContext();
  const { postTx } = usePostTx();

  const [minting, setMinting] = React.useState(false);

  const mintPrice = "price" in item ? item.price ?? parseEther("0.08") : 0n;

  const mint = async () => {
    setMinting(true);
    try {
      const res = await postTx({
        target: item.contract.address as Hex,
        data: encodeFunctionData({
          abi: ERC721Abi,
          functionName: "mintTo",
          args: [scaAddress as Hex],
        }),
        value: mintPrice,
      });
      if (res.success) {
        dispatchAlert({
          type: "open",
          alertType: "success",
          message: `Mint succsess to address ${scaAddress}: tx ${res.receipt.transactionHash}`,
        });
      } else {
        throw res.message;
      }
    } catch (error) {
      dispatchAlert({
        type: "open",
        alertType: "error",
        message: `Mint failed: ${error}`,
      });
    } finally {
      setMinting(false);
    }
  };

  return (
    <FormBottomSheet
      showBottomSheet={showBottomSheet}
      snapPoints={["70%"]}
      onClose={(): void => {
        setShowBottomSheet(false);
      }}
    >
      <View style={styles.body}>
        <View style={{ padding: 20 }}>
          <View
            style={{
              paddingVertical: 12,
              paddingHorizontal: 16,
              backgroundColor: "#FF002E0d",
              borderRadius: 14,
            }}
          >
            <FormText color={colors.error}>
              This action is irreversible. Again, make sure the transaction
              detail is correct and reliable.
            </FormText>
          </View>
        </View>
        <View style={styles.itemInfo}>
          <View style={{ marginBottom: 4 }}>
            <Row
              style={{
                columnGap: 12,
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 14,
                  overflow: "hidden",
                  margin: 6,
                }}
              >
                <FormImage
                  source={
                    item.media && item.media.length > 0
                      ? { uri: item.media[0].raw }
                      : require("../../assets/images/nft-placeholder.png")
                  }
                  size={60}
                />
              </View>
              <FormText font="B" size={16}>
                {item.title}
              </FormText>
              {item.tokenId && (
                <FormText>{`Token ID: (${item.tokenId})`}</FormText>
              )}
            </Row>

            <Row style={{ columnGap: 4, padding: 12 }}>
              <FormText size={14} font={"B"}>
                Mint Price:
              </FormText>
              <FormText
                size={14}
                color={colors.primary._400}
                font={"B"}
              >{`${formatEther(mintPrice)} ETH`}</FormText>
            </Row>
          </View>
          <Row
            style={{
              position: "relative",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            <View
              style={{
                position: "absolute",
                borderWidth: 0.5,
                borderColor: colors.black._200,
                width: "100%",
                top: 12,
              }}
            />
            <Row
              style={{
                alignItems: "center",
                backgroundColor: colors.black._10,
                paddingHorizontal: 20,
              }}
            >
              <FormText>on</FormText>
            </Row>
          </Row>
          <Row
            style={{ justifyContent: "space-between", alignItems: "center" }}
          >
            <View>
              <View style={styles.fromTo}>
                <FormText font={"SB"}>From</FormText>
              </View>
              <View style={{ paddingHorizontal: 4, rowGap: 4 }}>
                <Row style={{ columnGap: 6 }}>
                  <FormImage
                    source={require("../../assets/logo/kit-logo.png")}
                    size={20}
                    style={{ borderRadius: 50 }}
                  />
                  <FormText font={"B"}>Me</FormText>
                </Row>
                <FormText size={12} color={colors.black._400}>{`(${truncate(
                  scaAddress!,
                )})`}</FormText>
              </View>
            </View>
            <View>
              <Icon
                type={IconType.FontAwesome5}
                name="chevron-right"
                size={28}
                color={colors.black._200}
              />
            </View>

            <View>
              <View style={styles.fromTo}>
                <FormText font={"SB"}>To</FormText>
              </View>
              <View style={{ paddingHorizontal: 4, rowGap: 4 }}>
                <Row style={{ columnGap: 6 }}>
                  <FormImage
                    source={
                      item.media && item.media.length > 0
                        ? { uri: item.media[0].raw }
                        : require("../../assets/images/nft-placeholder.png")
                    }
                    size={20}
                    style={{ borderRadius: 50 }}
                  />
                  <FormText font={"B"}> {item.title}</FormText>
                </Row>
                <FormText size={12} color={colors.black._400}>{`(${truncate(
                  item.contract.address,
                )})`}</FormText>
              </View>
            </View>
          </Row>
        </View>
        <View style={styles.txInfo}>
          <Row style={{ justifyContent: "space-between" }}>
            <FormText font={"B"}>Est. Gas Fee</FormText>
            <FormText>{"0 ETH"}</FormText>
          </Row>
        </View>
      </View>
      <Row style={styles.footer}>
        <FormButton
          figure="outline"
          onPress={(): void => {
            setShowBottomSheet(false);
          }}
        >
          Reject
        </FormButton>
        <FormButton
          containerStyle={{ flex: 1 }}
          disabled={!scaAddress || minting}
          onPress={mint}
        >
          Confirm
        </FormButton>
      </Row>
    </FormBottomSheet>
  );
};

export default MintConfirmModal;

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  itemInfo: { backgroundColor: colors.black._10, padding: 20 },
  txInfo: { padding: 20 },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.black._90010,
    paddingVertical: 12,
    paddingHorizontal: 20,
    columnGap: 8,
  },
  fromTo: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "white",
    alignSelf: "flex-start",
    borderRadius: 8,
    marginBottom: 12,
  },
});
