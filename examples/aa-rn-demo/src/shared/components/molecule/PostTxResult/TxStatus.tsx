import FormButton from "@shared-components/atom/FormButton";
import FormImage from "@shared-components/atom/FormImage";
import FormText from "@shared-components/atom/FormText";
import LinkExplorer from "@shared-components/atom/LinkExplorer";
import Row from "@shared-components/atom/Row";
import postTxStore from "@store/postTxStore";
import _ from "lodash";
import React, { type ReactElement } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import Icon, { IconType } from "react-native-dynamic-vector-icons";
import { useRecoilValue } from "recoil";
import { PostTxStatus } from "types/postTx";

const StatusText = ({ children }: { children: string }): ReactElement => {
  return (
    <FormText style={{ marginBottom: 6 }} size={16} font="B" color="white">
      {children}
    </FormText>
  );
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
          <Icon type={IconType.FontAwesome5} name="times" size={20} />
        </TouchableOpacity>
        <View>
          {txResult.status === PostTxStatus.UO && (
            <>
              <View style={styles.iconBox}>
                <FormImage
                  source={require("../../../../assets/images/loading.gif")}
                  size={60}
                />
              </View>
              <View style={styles.status}>
                <StatusText>Sending user operation...</StatusText>
              </View>
            </>
          )}

          {txResult.status === PostTxStatus.POST && (
            <>
              <View style={styles.iconBox}>
                <FormImage
                  source={require("../../../../assets/images/loading.gif")}
                  size={60}
                />
              </View>
              <View style={styles.status}>
                <StatusText>Waiting for user op transaction ...</StatusText>
                {txResult.value.userOpHash && (
                  <LinkExplorer
                    type="userOp"
                    address={txResult.value.userOpHash}
                  />
                )}
              </View>
            </>
          )}

          {txResult.status === PostTxStatus.BROADCAST && (
            <>
              <View style={styles.iconBox}>
                <FormImage
                  source={require("../../../../assets/images/loading.gif")}
                  size={25}
                />
              </View>
              <View style={styles.status}>
                <StatusText>Transaction in progress ...</StatusText>
                {txResult.value.transactionHash && (
                  <LinkExplorer
                    type="tx"
                    address={txResult.value.transactionHash}
                  />
                )}
              </View>
            </>
          )}
          {txResult.status === PostTxStatus.DONE && (
            <>
              <Row style={{ flex: 1, paddingHorizontal: 10 }}>
                <Icon
                  style={{ marginRight: 20, marginTop: 10 }}
                  type={IconType.FontAwesome5}
                  name={"check"}
                  size={25}
                  color="green"
                />
                {txResult.value.transactionReceipt && (
                  <View style={styles.status}>
                    <StatusText>Transaction confirmed</StatusText>
                    <LinkExplorer
                      type="tx"
                      address={
                        txResult.value.transactionReceipt.transactionHash
                      }
                    />
                  </View>
                )}
              </Row>
              <FormButton
                figure="primary"
                containerStyle={{ backgroundColor: "#4caf50", marginTop: 10 }}
                onPress={onPressClose}
              >
                Success
              </FormButton>
            </>
          )}

          {txResult.status === PostTxStatus.ERROR && (
            <>
              <View style={styles.iconBox}>
                <Icon
                  type={IconType.FontAwesome5}
                  name={"exclamation-triangle"}
                  size={25}
                  color="red"
                />
              </View>
              {(txResult.value?.uoHash || txResult.value?.txHash) && (
                <View style={styles.status}>
                  <StatusText>
                    {`${
                      txResult.value.uoHash ? "User op" : "Transaction"
                    } failed`}
                  </StatusText>
                </View>
              )}
              <ScrollView
                style={{
                  maxHeight: 400,
                  backgroundColor: "#eeeeee",
                  padding: 10,
                  marginBottom: 10,
                }}
              >
                <FormText>
                  {_.truncate(
                    typeof txResult.error === "string"
                      ? txResult.error
                      : JSON.stringify(txResult.error),
                    { length: 300 },
                  )}
                </FormText>
              </ScrollView>
              <FormButton
                figure="error"
                containerStyle={{ marginTop: 10 }}
                onPress={onPressClose}
              >
                Close
              </FormButton>
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
    backgroundColor: "#000000E0",
    bottom: 0,
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
    padding: 20,
    zIndex: 1,
  },
  card: {
    width: 480,
    maxWidth: "100%",
    position: "relative",
    margin: "auto",
    marginBottom: 0,
    padding: 24,
  },
  iconBox: {
    alignItems: "center",
    paddingBottom: 10,
  },
});
