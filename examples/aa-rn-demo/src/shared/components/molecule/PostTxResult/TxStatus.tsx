import FormButton from "@shared-components/atom/FormButton";
import FormImage from "@shared-components/atom/FormImage";
import LinkExplorer from "@shared-components/atom/LinkExplorer";
import postTxStore from "@store/postTxStore";
import _ from "lodash";
import React, { type ReactElement } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon, { IconType } from "react-native-dynamic-vector-icons";
import { useRecoilValue } from "recoil";
import { PostTxStatus } from "types/postTx";

const StatusText = ({ children }: { children: string }): ReactElement => {
  return <Text>{children}</Text>;
};

const TxStatus = ({
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
    <View style={styles.container}>
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={(): void => {
            setMinimized(true);
          }}
        >
          <Icon type={IconType.FontAwesome5} name="ban" size={20} />
        </TouchableOpacity>
        <View>
          {txResult.status === PostTxStatus.POST && (
            <>
              <View style={styles.iconBox}>
                <FormImage
                  source={require("../../../../assets/images/loading.gif")}
                  size={60}
                />
              </View>
              <View style={styles.status}>
                <StatusText>Posting...</StatusText>
              </View>
            </>
          )}

          {txResult.status === PostTxStatus.BROADCAST && (
            <>
              <View style={styles.iconBox}>
                <FormImage
                  source={require("../../../../assets/images/loading.gif")}
                  size={60}
                />
              </View>
              <View style={styles.status}>
                <StatusText>Pending transaction</StatusText>
                <LinkExplorer type="tx" address={txResult.transactionHash} />
              </View>
            </>
          )}
          {txResult.status === PostTxStatus.DONE && (
            <>
              <Icon
                type={IconType.FontAwesome5}
                name={"check"}
                size={60}
                color="green"
              />
              {txResult.value && (
                <View style={styles.status}>
                  <LinkExplorer
                    type="tx"
                    address={txResult.value.transactionHash}
                  />
                </View>
              )}
              <FormButton onPress={onPressClose}>Success</FormButton>
            </>
          )}

          {txResult.status === PostTxStatus.ERROR && (
            <>
              <View style={styles.iconBox}>
                <Icon
                  type={IconType.FontAwesome5}
                  name={"exclamation-triangle"}
                  size={60}
                  color="red"
                />{" "}
              </View>
              <View style={styles.status}>
                <StatusText>Transaction failed</StatusText>
              </View>
              <ScrollView
                style={{
                  maxHeight: 300,
                  backgroundColor: "#eeeeee",
                  padding: 10,
                  marginBottom: 10,
                }}
              >
                <Text>{_.toString(txResult.error)}</Text>
              </ScrollView>
              <FormButton onPress={onPressClose}>Close</FormButton>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

export default TxStatus;

const styles = StyleSheet.create({
  container: {
    cursor: "zoom-in",
    position: "absolute",
    width: "100%",
    backgroundColor: "#00000099",
    top: 0,
    height: "100%",
    right: 0,
    zIndex: 1,
  },
  status: {
    alignItems: "center",
    marginBottom: 10,
  },
  closeBtn: {
    position: "absolute",
    right: 0,
    padding: 10,
    zIndex: 1,
  },
  card: {
    width: 480,
    maxWidth: "100%",
    position: "relative",
    margin: "auto",
    marginBottom: 0,
    paddingBottom: 50,
    padding: 24,
    borderRadius: 15,
  },
  iconBox: {
    alignItems: "center",
    paddingBottom: 10,
  },
});
