import FormImage from "@shared-components/atom/FormImage";
import FormText from "@shared-components/atom/FormText";
import LinkExplorer from "@shared-components/atom/LinkExplorer";
import { truncate } from "@shared-utils";
import postTxStore from "@store/postTxStore";
import { colors } from "@theme/color";
import _ from "lodash";
import React, { type ReactElement } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon, { IconType } from "react-native-dynamic-vector-icons";
import { Card } from "react-native-paper";
import { useRecoilValue } from "recoil";
import { PostTxStatus } from "types/postTx";

const TxStatusMini = ({
  onPressClose,
  setMinimized,
}: {
  onPressClose: () => void;
  setMinimized: React.Dispatch<React.SetStateAction<boolean>>;
}): ReactElement | null => {
  const postTxResult = useRecoilValue(postTxStore.postTxResult);
  const txResult = _.last(Object.values(postTxResult));
  if (txResult === undefined) return null;

  return (
    <Pressable
      style={styles.container}
      onPress={(): void => {
        setMinimized(false);
      }}
    >
      {[PostTxStatus.POST, PostTxStatus.BROADCAST].includes(txResult.status) ===
        false && (
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={(e): void => {
            onPressClose();
            e.stopPropagation();
          }}
        >
          <Icon type={IconType.FontAwesome5} name="times" size={20} />
        </TouchableOpacity>
      )}
      <Card style={styles.card}>
        {txResult.status === PostTxStatus.POST && (
          <>
            <View style={styles.iconBox}>
              <FormImage
                source={require("../../../../assets/images/loading.gif")}
                size={30}
              />
            </View>
            <View style={styles.status}>
              <FormText>Posting...</FormText>
            </View>
          </>
        )}

        {txResult.status === PostTxStatus.BROADCAST && (
          <>
            <View style={styles.iconBox}>
              <FormImage
                source={require("../../../../assets/images/loading.gif")}
                size={30}
              />
            </View>
            <View style={styles.status}>
              <FormText>Pending Tx...</FormText>
              <LinkExplorer type="tx" address={txResult.transactionHash}>
                <FormText style={{ color: colors.primary._400 }}>
                  {truncate(txResult.transactionHash, [4, 4])}
                </FormText>
              </LinkExplorer>
            </View>
          </>
        )}

        {txResult.status === PostTxStatus.DONE && (
          <>
            <View style={styles.iconBox}>
              <Icon
                type={IconType.FontAwesome5}
                name={"check"}
                size={30}
                color="green"
              />
            </View>
            {txResult.value ? (
              <View style={styles.status}>
                <LinkExplorer
                  type="tx"
                  address={txResult.value.transactionHash}
                >
                  <Text style={{ color: colors.primary._400 }}>
                    {truncate(txResult.value.transactionHash, [4, 4])}
                  </Text>
                </LinkExplorer>
              </View>
            ) : (
              <Text>Done</Text>
            )}
          </>
        )}

        {txResult.status === PostTxStatus.ERROR && (
          <>
            <View style={styles.iconBox}>
              <Icon
                type={IconType.FontAwesome5}
                name={"exclamation-triangle"}
                size={30}
                color="red"
              />
            </View>
            <View style={styles.status}>
              <FormText>Tx Error</FormText>
            </View>
          </>
        )}
      </Card>
    </Pressable>
  );
};

export default TxStatusMini;

const styles = StyleSheet.create({
  status: {
    alignItems: "center",
    marginBottom: 10,
  },
  container: {
    position: "absolute",
    top: 120,
    right: 0,
    zIndex: 1,
    cursor: "zoom-in",
  },
  closeBtn: {
    position: "absolute",
    right: 0,
    padding: 10,
    zIndex: 1,
  },
  card: {
    minWidth: 100,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    padding: 16,
    paddingBottom: 10,
    borderRadius: 20,
    alignItems: "center",
    backgroundColor: colors.primary._100,
    borderWidth: 2,
    borderColor: colors.primary._300,
    borderRightWidth: 0,
  },
  iconBox: {
    alignItems: "center",
  },
});
